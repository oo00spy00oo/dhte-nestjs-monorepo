import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { UserService } from '@zma-nestjs-monorepo/zma-grpc';
import { Exception } from '@zma-nestjs-monorepo/zma-middlewares';
import {
  ErrorCode,
  MicroserviceInput,
  Pagination,
  ServiceName,
  UserServiceSubject,
} from '@zma-nestjs-monorepo/zma-types';
import {
  UserServiceInputMapper,
  UserServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/user';
import {
  FnsServiceUserResponseGqlOutput,
  FnsServiceUserResponseOutput,
  FnsServiceUserResponsesGqlOutput,
} from '@zma-nestjs-monorepo/zma-types/outputs/fns';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import mongoose from 'mongoose';
import { firstValueFrom } from 'rxjs';

import { IDataServices } from '../../core';
import {
  FnsServiceCreateUserResponseFormGqlInput,
  FnsServiceCreateUserResponseSurveyGqlInput,
  FnsServiceFindUserResponsesToFormGqlInput,
  FnsServiceFindUserResponsesToSurveyGqlInput,
  FnsServiceUserResponseAddtionalInput,
  FnsServiceUserResponseFactoryInput,
} from '../../core/inputs';
import { CommonUtils } from '../../utils/common.utils';

import { UserResponseFactoryUseCase } from './user-response-factory.use-case';

@Injectable()
export class UserResponseUseCase {
  private readonly logger = new Logger(UserResponseUseCase.name);
  private userService: UserService;
  constructor(
    @Inject(ServiceName.USER) private clientGrpc: ClientGrpc,
    private factoryService: UserResponseFactoryUseCase,
    private dataServices: IDataServices,
  ) {}

  onModuleInit() {
    this.userService = this.clientGrpc.getService<UserService>(ServiceName.USER);
  }

  private createMicroserviceInput<T>(data: T): MicroserviceInput<T> {
    return new MicroserviceInput<T>({
      data,
      requestId: IdUtils.uuidv7(),
    });
  }

  private async findUserById({
    userId,
    tenantId,
  }: {
    userId: string;
    tenantId: string;
  }): Promise<UserServiceOutputMapper<UserServiceSubject.FindById> | null> {
    if (!userId) {
      this.logger.warn(`User ID is not provided, skipping user lookup.`);
      return null;
    }
    try {
      const findUserByIdInput = this.createMicroserviceInput<
        UserServiceInputMapper<UserServiceSubject.FindById>
      >({ id: userId, tenantId });

      return firstValueFrom(this.userService.userServiceFindById(findUserByIdInput));
    } catch (error) {
      this.logger.error(`Failed to find user by id: ${userId}`, error.stack);
      return null;
    }
  }

  private async findUsersByIds({
    userIds,
    tenantId,
  }: {
    userIds: string[];
    tenantId: string;
  }): Promise<UserServiceOutputMapper<UserServiceSubject.FindByIds> | null> {
    if (!userIds || userIds.length === 0) {
      this.logger.warn(`User IDs are not provided, skipping user lookup.`);
      return null;
    }
    try {
      const findUsersByIdsInput = this.createMicroserviceInput<
        UserServiceInputMapper<UserServiceSubject.FindByIds>
      >({ ids: userIds, tenantId });

      return firstValueFrom(this.userService.userServiceFindByIds(findUsersByIdsInput));
    } catch (error) {
      this.logger.error(`Failed to find users by ids: ${userIds.join(', ')}`, error.stack);
      return null;
    }
  }

  private async createUserResponse<
    TInput extends
      | FnsServiceCreateUserResponseSurveyGqlInput
      | FnsServiceCreateUserResponseFormGqlInput,
  >({
    tenantId,
    input,
    userId,
  }: {
    tenantId: string;
    input: TInput;
    userId?: string;
  }): Promise<FnsServiceUserResponseGqlOutput> {
    const isSurvey = 'surveyId' in input;
    const service = isSurvey ? this.dataServices.surveyService : this.dataServices.formService;
    const entityId = isSurvey ? input.surveyId : input.formId;

    const existingEntity = await service.findOne({
      tenantId,
      find: {
        filter: {
          _id: entityId,
          isActive: true,
          isDeleted: false,
        },
      },
    });

    if (!existingEntity) {
      throw new Exception(isSurvey ? ErrorCode.SURVEY_NOT_FOUND : ErrorCode.FORM_NOT_FOUND);
    }

    if (!existingEntity.isAnonymous && !userId) {
      throw new Exception(ErrorCode.USER_NOT_AUTHORIZED_TO_RESPOND);
    }

    CommonUtils.validateUserResponse({ entity: existingEntity, input });

    const createdEntity = await this.dataServices.userResponseService.create({
      tenantId,
      item: { ...input, userId: userId ?? null },
    });

    if (!createdEntity) {
      throw new Exception(ErrorCode.CREATE_USER_RESPONSE_FAILED);
    }

    return this.factoryService.transform({ entity: createdEntity });
  }

  async createUserResponseToSurvey({
    tenantId,
    input,
    userId,
  }: {
    tenantId: string;
    input: FnsServiceCreateUserResponseSurveyGqlInput;
    userId?: string;
  }): Promise<FnsServiceUserResponseGqlOutput> {
    return this.createUserResponse({ tenantId, input, userId });
  }

  async createUserResponseToForm({
    tenantId,
    input,
    userId,
  }: {
    tenantId: string;
    input: FnsServiceCreateUserResponseFormGqlInput;
    userId?: string;
  }): Promise<FnsServiceUserResponseGqlOutput> {
    return this.createUserResponse({ tenantId, input, userId });
  }

  private async getUserResponses({
    tenantId,
    pagination,
    filterKey,
    filterValue,
  }: {
    tenantId: string;
    pagination: Pagination;
    filterKey: 'surveyId' | 'formId';
    filterValue?: string | null;
  }): Promise<FnsServiceUserResponsesGqlOutput> {
    const { skip, limit } = pagination;

    // Build filter
    const filter = {
      tenantId: new mongoose.Types.UUID(tenantId),
      [filterKey]: filterValue ? new mongoose.Types.UUID(filterValue) : { $exists: true },
    };

    // Build pipeline
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: filterKey === 'surveyId' ? 'surveys' : 'forms',
          localField: filterKey,
          foreignField: '_id',
          as: filterKey === 'surveyId' ? 'survey' : 'form',
        },
      },
      {
        $unwind: {
          path: filterKey === 'surveyId' ? '$survey' : '$form',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $facet: {
          data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }],
          total: [{ $count: 'count' }],
        },
      },
    ];

    const result = await this.dataServices.userResponseService.aggregate({ pipeline });
    const data = result[0]?.data ?? [];
    const total = result[0]?.total?.[0]?.count ?? 0;

    // Collect user IDs for batch fetch
    const userIds = [
      ...new Set<string>(data.map((item) => item.userId?.toString()).filter(Boolean)),
    ];

    const users = await this.findUsersByIds({ userIds, tenantId });

    const userMap = new Map(
      users?.data
        ?.filter(Boolean)
        .map((user) => [
          user._id,
          [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
        ]) ?? [],
    );

    // Map entities
    const entities: FnsServiceUserResponseFactoryInput[] = data.map((item) => {
      const source = item.formId ? item.form : item.survey;
      const questions =
        source?.questions?.map((q) => ({
          questionId: q.questionId,
          questionName: q.text,
        })) || [];

      return {
        entity: item,
        additionalInput: {
          userName: userMap.get(item.userId?.toString() || ''),
          formTitle: item.form?.title || null,
          surveyTitle: item.survey?.title || null,
          questions,
        },
      };
    });

    return this.factoryService.transformMany({ entities, total });
  }

  async getUserResponsesToSurveyForAdmin({
    tenantId,
    input,
    pagination,
  }: {
    tenantId: string;
    input: FnsServiceFindUserResponsesToSurveyGqlInput;
    pagination: Pagination;
  }): Promise<FnsServiceUserResponsesGqlOutput> {
    return this.getUserResponses({
      tenantId,
      pagination,
      filterKey: 'surveyId',
      filterValue: input.surveyId,
    });
  }

  async getUserResponsesToFormForAdmin({
    tenantId,
    input,
    pagination,
  }: {
    tenantId: string;
    input: FnsServiceFindUserResponsesToFormGqlInput;
    pagination: Pagination;
  }): Promise<FnsServiceUserResponsesGqlOutput> {
    return this.getUserResponses({
      tenantId,
      pagination,
      filterKey: 'formId',
      filterValue: input.formId,
    });
  }

  async getUserResponseByIdForAdmin({
    tenantId,
    id,
  }: {
    tenantId: string;
    id: string;
  }): Promise<FnsServiceUserResponseGqlOutput> {
    const entity = await this.dataServices.userResponseService.findById({ tenantId, id });
    if (!entity) throw new Exception(ErrorCode.USER_RESPONSE_NOT_FOUND);

    const [user, formEntity, surveyEntity] = await Promise.all([
      this.findUserById({ userId: entity.userId?.toString(), tenantId }),
      entity.formId
        ? this.dataServices.formService.findById({
            tenantId,
            id: entity.formId?.toString(),
          })
        : null,
      entity.surveyId
        ? this.dataServices.surveyService.findById({
            tenantId,
            id: entity.surveyId?.toString(),
          })
        : null,
    ]);

    const additionalInput: FnsServiceUserResponseAddtionalInput = {
      userName: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || null,
      formTitle: formEntity?.title || null,
      surveyTitle: surveyEntity?.title || null,
      questions:
        (formEntity || surveyEntity)?.questions.map((q) => ({
          questionId: q.questionId,
          questionName: q.text,
        })) || [],
    };

    return this.factoryService.transform({ entity, additionalInput });
  }

  async getUserResponse({
    tenantId,
    surveyId,
    formId,
    userId,
  }: {
    tenantId: string;
    surveyId?: string;
    formId?: string;
    userId: string;
  }): Promise<FnsServiceUserResponseOutput> {
    // Validate that exactly one of surveyId or formId is present
    if ((!surveyId && !formId) || (surveyId && formId)) {
      throw new Exception(ErrorCode.OPERATION_NOT_ALLOWED);
    }
    const filter = {
      tenantId,
      userId,
      isDeleted: false,
      ...(surveyId ? { surveyId } : { formId }),
    };

    const entities = await this.dataServices.userResponseService.findMany({
      tenantId,
      find: { filter },
      options: { sort: { createdAt: -1 }, limit: 1 },
    });

    if (!entities || entities.length === 0) {
      throw new Exception(ErrorCode.USER_RESPONSE_NOT_FOUND);
    }
    return this.factoryService.transform({ entity: entities[0] });
  }
}
