import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc, ClientKafka } from '@nestjs/microservices';
import { OrganizationService } from '@zma-nestjs-monorepo/zma-grpc';
import { Exception } from '@zma-nestjs-monorepo/zma-middlewares';
import {
  AuthenticatedUser,
  ErrorCode,
  KafkaToken,
  KafkaTopic,
  MicroserviceInput,
  OrganizationServiceSubject,
  Pagination,
  ServiceName,
  UserServiceSubject,
  UserServiceUserStatus,
  UserServiceUserType,
} from '@zma-nestjs-monorepo/zma-types';
import {
  UserServiceFindUsersForAdminInput,
  UserServiceGetZaloUsersGqlInput,
} from '@zma-nestjs-monorepo/zma-types/inputs/user';
import {
  OrganizationServiceInputMapper,
  OrganizationServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/organization';
import {
  UserServiceEventInputMapper,
  UserServiceInputMapper,
  UserServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/user';
import {
  UserServiceSocialProviders,
  UserServiceUser,
  UserServiceUsersGlqOutput,
} from '@zma-nestjs-monorepo/zma-types/outputs/user/user';
import * as bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import mongoose from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { uuidv7 } from 'uuidv7';

import { IDataServices } from '../../core/abstracts';
import { UpdateProfileInput } from '../../core/inputs';

import { UserFactoryService } from './user-factory.service';

@Injectable()
export class UserUseCase {
  private readonly logger = new Logger(UserUseCase.name);
  private organizationService: OrganizationService;

  constructor(
    private dataServices: IDataServices,
    private factoryService: UserFactoryService,
    @Inject(KafkaToken.UserService) private readonly kafkaClient: ClientKafka,
    @Inject(ServiceName.ORGANIZATION) private readonly organizationClientGrpc: ClientGrpc,
  ) {}

  async onModuleInit() {
    this.kafkaClient.connect();
    this.logger.log('Kafka client connected for UserService');
    this.organizationService = this.organizationClientGrpc.getService<OrganizationService>(
      ServiceName.ORGANIZATION,
    );
  }

  async onApplicationShutdown(signal: string) {
    this.logger.log(`Received shutdown signal: ${signal}`);
    await this.kafkaClient.close();
    this.logger.log('Kafka client disconnected for UserService');
  }

  private getEmailForDeletion(email: string): string {
    // Append current timestamp to email for uniqueness
    return `${email}+${dayjs().valueOf()}`;
  }

  async getUser({ tenantId, id }: { tenantId: string; id: string }): Promise<UserServiceUser> {
    const entity = await this.dataServices.userService.findById({ tenantId, id });

    if (!entity || entity.isDeleted) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }

    return this.factoryService.transform(entity);
  }

  async getUserForAdmin({
    tenantId,
    id,
  }: {
    tenantId: string;
    id: string;
  }): Promise<UserServiceUser> {
    const entity = await this.dataServices.userService.findById({ tenantId, id });

    if (!entity) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }

    return this.factoryService.transform(entity);
  }

  async getUsers({
    tenantId,
    ids,
  }: {
    tenantId: string;
    ids: string[];
  }): Promise<UserServiceUser[]> {
    const entities = await this.dataServices.userService.findMany({
      tenantId,
      find: {
        filter: {
          _id: { $in: ids },
          status: UserServiceUserStatus.Active,
          isDeleted: false,
        },
      },
    });
    return entities.map((entity) => this.factoryService.transform(entity));
  }

  async getAllUsers({
    tenantId,
    pagination,
  }: {
    tenantId: string;
    pagination: Pagination;
  }): Promise<UserServiceUser[]> {
    const { skip, limit } = pagination;
    const filter = {
      status: UserServiceUserStatus.Active,
      type: UserServiceUserType.User,
      isDeleted: false,
    };
    const entities = await this.dataServices.userService.findMany({
      tenantId,
      find: {
        filter,
      },
      options: {
        sort: { email: 1 },
        limit,
        skip,
      },
    });
    return entities.map((entity) => this.factoryService.transform(entity));
  }

  async getAllUsersByType(
    user: AuthenticatedUser,
    {
      pagination,
      tenantIds,
      input,
      type = UserServiceUserType.User,
    }: {
      pagination: Pagination;
      tenantIds: string[];
      input?: UserServiceFindUsersForAdminInput;
      type?: UserServiceUserType;
    },
  ): Promise<UserServiceUsersGlqOutput> {
    // Validation of user.type
    // Admin: can see all OrganizationAdmin, Agency, TenantAdmin
    // Agency: can see OrganizationAdmin createdBy that Agency, TenantAdmin with organizationId of that Agency
    // OrganizationAdmin: can see all TenantAdmin createdBy that OrganizationAdmin
    // Another user: block
    if (user.type === UserServiceUserType.Admin) {
      return this.getAllUsersForAdmin({ pagination, tenantIds, input, type });
    }

    if (user.type === UserServiceUserType.Agency) {
      const allowTypes = [UserServiceUserType.OrganizationAdmin, UserServiceUserType.TenantAdmin];
      if (!allowTypes.includes(type)) {
        throw new Exception(ErrorCode.OPERATION_NOT_ALLOWED);
      }
      return this.getAllUsersForAgency(user, { pagination, input, type });
    }

    if (user.type === UserServiceUserType.OrganizationAdmin) {
      const allowTypes = [UserServiceUserType.TenantAdmin];
      if (!allowTypes.includes(type)) {
        throw new Exception(ErrorCode.OPERATION_NOT_ALLOWED);
      }
      return this.getAllUsersForOrganizationAdmin(user.id, { pagination, tenantIds, input, type });
    }

    // For other user types, deny access for now
    throw new Exception(ErrorCode.OPERATION_NOT_ALLOWED);
  }

  async getAllUsersForOrganizationAdmin(
    userId: string,
    {
      pagination,
      tenantIds,
      input,
      type = UserServiceUserType.User,
    }: {
      pagination: Pagination;
      tenantIds: string[];
      input?: UserServiceFindUsersForAdminInput;
      type?: UserServiceUserType;
    },
  ): Promise<UserServiceUsersGlqOutput> {
    if (!tenantIds.length) {
      throw new Exception(ErrorCode.TENANT_NOT_FOUND);
    }
    const { skip, limit } = pagination;
    const { emails, statuses } = input ?? {};
    const filterTenantIds = tenantIds.map((id) => new mongoose.Types.UUID(id));
    const filter = {
      ...(statuses && { status: { $in: statuses } }),
      ...(emails && { email: { $in: emails } }),
      type,
      tenantId: { $in: filterTenantIds },
      createdBy: userId,
    };
    return this.getUserByAggregate({
      filter,
      skip,
      limit,
    });
  }

  async getAllUsersForAdmin({
    pagination,
    tenantIds,
    input,
    type = UserServiceUserType.User,
  }: {
    pagination: Pagination;
    tenantIds: string[];
    input?: UserServiceFindUsersForAdminInput;
    type?: UserServiceUserType;
  }): Promise<UserServiceUsersGlqOutput> {
    const { skip, limit } = pagination;
    const { emails, statuses, search } = input ?? {};
    const filterTenantIds = tenantIds.map((id) => new mongoose.Types.UUID(id));
    const filter: Record<string, unknown> = {
      ...(statuses && { status: { $in: statuses } }),
      ...(emails && { email: { $in: emails } }),
      type,
    };
    if (filterTenantIds.length > 0) {
      filter.tenantId = { $in: filterTenantIds };
    }

    // Add search filter for user ID if provided
    if (search) {
      filter._id = { $regex: search, $options: 'i' };
    }

    return this.getUserByAggregate({
      filter,
      skip,
      limit,
    });
  }

  async getAllUsersForAgency(
    user: AuthenticatedUser,
    {
      pagination,
      input,
      type = UserServiceUserType.User,
    }: {
      pagination: Pagination;
      input?: UserServiceFindUsersForAdminInput;
      type?: UserServiceUserType;
    },
  ): Promise<UserServiceUsersGlqOutput> {
    try {
      const organizationInput = new MicroserviceInput<
        OrganizationServiceInputMapper<OrganizationServiceSubject.FindByUserId>
      >({
        requestId: uuidv7(),
        data: {
          userId: user.id,
        },
      });
      // Get all organizations created by this agency
      const organizationsResponse: OrganizationServiceOutputMapper<OrganizationServiceSubject.FindByUserId> =
        await firstValueFrom(
          this.organizationService.organizationServiceFindByUserId(organizationInput),
        );

      const organizations = organizationsResponse.data || [];
      const organizationIds = organizations.map((org) => org._id);

      if (organizationIds.length === 0) {
        // If no organizations found, return empty result
        return this.factoryService.transformMany({
          entities: [],
          total: 0,
        });
      }

      const { skip, limit } = pagination;
      const { emails, statuses, search } = input ?? {};

      // Filter users by organizationId from the organizations created by this agency
      const filter: Record<string, unknown> = {
        ...(statuses && { status: { $in: statuses } }),
        ...(emails && { email: { $in: emails } }),
        type,
        organizationId: { $in: organizationIds },
      };

      // Add search filter for user ID if provided
      if (search) {
        filter._id = { $regex: search, $options: 'i' };
      }

      return this.getUserByAggregate({
        filter,
        skip,
        limit,
      });
    } catch (error) {
      this.logger.error('Error fetching organizations for agency user:', error);
      throw new Exception(ErrorCode.OPERATION_NOT_ALLOWED);
    }
  }

  async getAllZaloUsers(
    input: UserServiceGetZaloUsersGqlInput,
    tenantId: string,
  ): Promise<UserServiceUser[]> {
    if (!tenantId) {
      throw new Exception(ErrorCode.TENANT_NOT_FOUND);
    }
    const { skip, limit, status, sortBy, sortDirection, search } = input;
    const filter: Record<string, unknown> = {
      type: UserServiceUserType.Zalo,
      tenantId,
      isDeleted: false,
    };

    // Add status filter if provided, otherwise default to Active
    if (status) {
      filter.status = status;
    } else {
      filter.status = UserServiceUserStatus.Active;
    }

    // Add search filter if provided
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort object
    let sort: string | Record<string, number> = { createdAt: -1 }; // Default sort
    if (sortBy) {
      const direction = sortDirection === 'ASC' ? 1 : -1;
      sort = { [sortBy]: direction };
    }

    const entities = await this.dataServices.userService.findMany({
      tenantId,
      find: {
        filter,
      },
      options: {
        sort,
        limit,
        skip,
      },
    });
    return entities.map((entity) => this.factoryService.transform(entity));
  }

  async createOrganizationAdmin(
    tenantId: string,
    input: UserServiceInputMapper<UserServiceSubject.Create>,
    createdBy: string,
  ): Promise<UserServiceUser> {
    return this.createPortalUser({
      tenantId,
      input,
      createdBy,
      type: UserServiceUserType.OrganizationAdmin,
    });
  }

  async createAgency(
    input: UserServiceInputMapper<UserServiceSubject.Create>,
    createdBy: string,
  ): Promise<UserServiceUser> {
    return this.createPortalUser({
      tenantId: '',
      input,
      createdBy,
      type: UserServiceUserType.Agency,
    });
  }

  async createTenantAdmin(
    tenantId: string,
    input: UserServiceInputMapper<UserServiceSubject.Create>,
    createdBy: string,
  ): Promise<UserServiceUser> {
    return this.createPortalUser({
      tenantId,
      input,
      createdBy,
      type: UserServiceUserType.TenantAdmin,
    });
  }

  async createPortalUser({
    tenantId,
    input,
    createdBy,
    type,
  }: {
    tenantId: string;
    input: UserServiceInputMapper<UserServiceSubject.Create>;
    createdBy: string;
    type: UserServiceUserType;
  }) {
    const hashedPassword = await bcrypt.hash(input.password, 10);
    return this.createUser({
      tenantId,
      input: { ...input, password: hashedPassword, type },
      status: UserServiceUserStatus.Active,
      createdBy,
    });
  }

  async createUser({
    tenantId,
    input,
    status = UserServiceUserStatus.Pending,
    createdBy,
  }: {
    tenantId: string;
    input: UserServiceInputMapper<UserServiceSubject.Create>;
    status?: UserServiceUserStatus;
    createdBy?: string;
  }): Promise<UserServiceUser> {
    const newUser = {
      ...input,
      type: input.type ?? UserServiceUserType.User,
      status,
      createdBy,
    };

    this.logger.log('createUser', { ...newUser, password: '[REDACTED]' });

    const existingUser = await this.dataServices.userService.findOne({
      tenantId,
      find: {
        filter: { email: newUser.email, isDeleted: false },
      },
    });
    if (existingUser) {
      throw new Exception(ErrorCode.USER_ALREADY_EXISTS);
    }

    const entity = await this.dataServices.userService.create({
      tenantId,
      item: newUser,
    });

    if (!entity) {
      throw new Exception(ErrorCode.CREATE_USER_FAILED);
    }

    await this.dataServices.userService.updateOne({
      tenantId,
      id: entity._id,
      update: { item: { organizationId: input.organizationId } },
    });

    return this.factoryService.transform(entity);
  }

  async createZaloUser({
    tenantId,
    input,
  }: {
    tenantId: string;
    input: UserServiceInputMapper<UserServiceSubject.CreateZaloUser>;
  }): Promise<UserServiceUser> {
    const newUser = {
      ...input,
      type: UserServiceUserType.Zalo,
      status: UserServiceUserStatus.Active,
    };

    const existingUser = await this.dataServices.userService.findOne({
      tenantId,
      find: { filter: { zaloId: newUser.zaloId, isDeleted: false } },
    });

    if (existingUser) {
      throw new Exception(ErrorCode.USER_ALREADY_EXISTS);
    }

    const entity = await this.dataServices.userService.create({
      tenantId,
      item: newUser,
    });

    if (!entity) {
      throw new Exception(ErrorCode.CREATE_USER_FAILED);
    }

    // Emit userCreatedEvent to Kafka
    const userCreatedEventInput: UserServiceEventInputMapper<KafkaTopic.UserCreatedEventTopic> = {
      requestId: uuidv7(),
      userId: entity._id,
      tenantId: entity.tenantId,
    };

    try {
      this.kafkaClient.emit<string, UserServiceEventInputMapper<KafkaTopic.UserCreatedEventTopic>>(
        KafkaTopic.UserCreatedEventTopic,
        userCreatedEventInput,
      );
    } catch (error) {
      this.logger.error('Failed to emit userCreatedEvent event', error);
    }

    return this.factoryService.transform(entity);
  }

  async updateUser({
    tenantId,
    userId,
    input,
  }: {
    tenantId: string;
    userId: string;
    input: UserServiceInputMapper<UserServiceSubject.Update>;
  }): Promise<UserServiceUser> {
    const { ...rest } = input;
    const existingUser = await this.dataServices.userService.findById({ tenantId, id: userId });

    if (!existingUser || existingUser.isDeleted) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }

    if (existingUser.type !== UserServiceUserType.Zalo && input?.email) {
      throw new Exception(ErrorCode.UPDATE_USER_EMAIL_NOT_ALLOWED);
    }

    const updatedUser = {
      ...rest,
      type: existingUser.type,
      status: existingUser.status,
      tenantId: existingUser.tenantId,
      socialProviders: existingUser?.socialProviders ?? null,
      createdAt: existingUser.createdAt,
      updatedAt: existingUser.updatedAt,
      resetToken: existingUser?.resetToken ?? null,
      resetTokenExpiry: existingUser?.resetTokenExpiry ?? null,
    };
    const entity = await this.dataServices.userService.updateOne({
      tenantId,
      id: userId,
      update: { item: updatedUser },
    });
    if (!entity) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }
    return this.factoryService.transform(entity);
  }

  async deleteUsers({
    tenantId,
    ids,
  }: {
    tenantId: string;
    ids: string[];
  }): Promise<UserServiceOutputMapper<UserServiceSubject.Delete>> {
    const entity = await this.dataServices.userService.updateMany({
      tenantId,
      filter: { _id: { $in: ids } },
      update: {
        item: { deletedAt: new Date(), isDeleted: true },
      },
    });
    return {
      status: !!entity.modifiedCount,
    };
  }

  // This is the function for impersonate user, in case, admin want to login as OrganizationAdmin, There is no tenantId
  async findByIdWithoutTenant({ id }: { id: string }): Promise<UserServiceUser> {
    const entity = await this.dataServices.userService.findById({ id });
    if (!entity || entity.isDeleted) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }
    return this.factoryService.transform(entity);
  }

  async findById({ tenantId, id }: { tenantId: string; id: string }): Promise<UserServiceUser> {
    if (!tenantId) {
      return this.findByIdWithoutTenant({ id });
    }
    const entity = await this.dataServices.userService.findById({ tenantId, id });
    if (!entity || entity.isDeleted) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }
    return this.factoryService.transform(entity);
  }

  async findByEmail({
    tenantId,
    email,
  }: {
    tenantId: string;
    email: string;
  }): Promise<UserServiceUser> {
    const entity = await this.dataServices.userService.findOne({
      tenantId,
      find: { filter: { email, isDeleted: false } },
    });
    if (!entity) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }
    return this.factoryService.transform(entity);
  }

  async findByZaloIdAndTenantId({
    tenantId,
    zaloId,
  }: {
    zaloId: string;
    tenantId: string;
  }): Promise<UserServiceUser> {
    const entity = await this.dataServices.userService.findOne({
      tenantId,
      find: { filter: { zaloId, tenantId, isDeleted: false } },
    });
    if (!entity) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }
    return this.factoryService.transform(entity);
  }

  async updateProfile({
    tenantId,
    userId,
    input,
  }: {
    tenantId: string;
    userId: string;
    input: UpdateProfileInput;
  }): Promise<UserServiceUser> {
    const updateInput = {
      ...input,
      id: userId,
      tenantId,
    };
    return this.updateUser({ tenantId, userId, input: updateInput });
  }

  async updateAvatar({
    tenantId,
    userId,
    avatarUrl,
  }: {
    tenantId: string;
    userId: string;
    avatarUrl: string;
  }): Promise<UserServiceUser> {
    const existingUser = await this.dataServices.userService.findById({ tenantId, id: userId });
    if (!existingUser || existingUser.isDeleted) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }
    const user = await this.dataServices.userService.updateOne({
      tenantId,
      id: userId,
      update: { item: { avatarUrl } },
    });
    if (!user) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }
    return this.factoryService.transform(user);
  }

  async updateZaloOAId({
    tenantId,
    userId,
    zaloOAId,
  }: {
    tenantId: string;
    userId: string;
    zaloOAId: string;
  }): Promise<UserServiceUser> {
    const existingUser = await this.dataServices.userService.findById({ tenantId, id: userId });
    if (!existingUser || existingUser.isDeleted) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }
    const user = await this.dataServices.userService.updateOne({
      tenantId,
      id: userId,
      update: { item: { zaloOAId } },
    });
    if (!user) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }
    return this.factoryService.transform(user);
  }

  async findZaloUsersByTenantId({ tenantId }: { tenantId: string }): Promise<UserServiceUser[]> {
    const filter = {
      status: UserServiceUserStatus.Active,
      tenantId: tenantId,
      isDeleted: false,
      type: UserServiceUserType.Zalo,
    };
    const entities = await this.dataServices.userService.findMany({
      tenantId,
      find: {
        filter,
      },
      options: {
        sort: { email: 1 },
      },
    });
    return entities.map((entity) => this.factoryService.transform(entity));
  }

  async updateStatus({
    id,
    tenantId,
    status,
  }: {
    id: string;
    tenantId: string;
    status: string;
  }): Promise<UserServiceUser> {
    const existingUser = await this.dataServices.userService.findById({ id, tenantId });
    if (!existingUser || existingUser.isDeleted) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }
    const isValidStatus = Object.values(UserServiceUserStatus).includes(
      status as UserServiceUserStatus,
    );
    if (!isValidStatus) {
      throw new Exception(ErrorCode.INVALID_USER_STATUS);
    }
    const updatedData = {
      status: status as UserServiceUserStatus,
    };
    const updatedUser = await this.dataServices.userService.updateOne({
      tenantId,
      id,
      update: { item: updatedData },
    });
    return this.factoryService.transform(updatedUser);
  }

  async confirmByCode({
    userId,
    tenantId,
    code,
  }: {
    userId: string;
    tenantId: string;
    code: string;
  }): Promise<UserServiceUser> {
    const user = await this.dataServices.userService.findOne({
      tenantId,
      find: { filter: { _id: userId, verificationCode: code, isDeleted: false } },
    });

    if (!user) {
      throw new Exception(ErrorCode.INVALID_VERIFICATION_CODE);
    }

    const updatedUser = await this.dataServices.userService.updateOne({
      tenantId,
      id: user._id,
      update: {
        item: {
          status: UserServiceUserStatus.Active,
          verificationCode: null,
        },
      },
    });

    return this.factoryService.transform(updatedUser);
  }

  async incrementFailedLoginAttempts({
    tenantId,
    userId,
  }: {
    tenantId: string;
    userId: string;
  }): Promise<UserServiceUser> {
    const user = await this.dataServices.userService.findById({ tenantId, id: userId });

    if (!user || user.isDeleted) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }

    const updatedUser = await this.dataServices.userService.updateOne({
      tenantId,
      id: userId,
      update: { operator: { $inc: { failedLoginAttempts: 1 } } },
    });

    return this.factoryService.transform(updatedUser);
  }

  async resetVerificationCode({
    tenantId,
    id,
  }: {
    tenantId: string;
    id: string;
  }): Promise<UserServiceUser> {
    const user = await this.dataServices.userService.findById({ tenantId, id });
    if (!user || user.isDeleted) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }

    const updatedUser = await this.dataServices.userService.updateOne({
      tenantId,
      id,
      update: { item: { verificationCode: null } },
    });

    return this.factoryService.transform(updatedUser);
  }

  async deleteUser({ tenantId, id }: { tenantId: string; id: string }): Promise<boolean> {
    const user = await this.dataServices.userService.findById({ tenantId, id });
    if (!user || user.isDeleted) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }

    const emailForDeletion = this.getEmailForDeletion(user.email);
    const updatedUser = await this.dataServices.userService.updateOne({
      tenantId,
      id,
      update: { item: { email: emailForDeletion, isDeleted: true, deletedAt: new Date() } },
    });

    return !!updatedUser;
  }

  async updateSocialProviders({
    id,
    tenantId,
    socialProviders,
  }: {
    id: string;
    tenantId: string;
    socialProviders: UserServiceSocialProviders;
  }): Promise<UserServiceUser> {
    const user = await this.dataServices.userService.findById({ tenantId, id });
    if (!user || user.isDeleted) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }

    const updatedUser = await this.dataServices.userService.updateOne({
      tenantId,
      id,
      update: { item: { socialProviders } },
    });

    return this.factoryService.transform(updatedUser);
  }

  async updateUserActivity({
    userId,
    tenantId,
    activityTimestamp,
  }: {
    userId: string;
    tenantId: string;
    activityTimestamp: Date;
  }): Promise<boolean> {
    try {
      const user = await this.dataServices.userService.findById({ tenantId, id: userId });
      if (!user || user.isDeleted) {
        this.logger.warn(`User not found for activity update: ${userId}`);
        return false;
      }

      const updatedUser = await this.dataServices.userService.updateOne({
        tenantId,
        id: userId,
        update: { item: { lastActive: activityTimestamp } },
      });

      if (updatedUser) {
        this.logger.log(
          `Updated lastActive for user ${userId} at ${activityTimestamp.toISOString()}`,
        );
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to update user activity for ${userId}:`, error);
      return false;
    }
  }

  async validateAgencyCanImpersonate({
    agencyUserId,
    targetUserId,
    tenantId,
  }: {
    agencyUserId: string;
    targetUserId: string;
    tenantId: string;
  }): Promise<boolean> {
    const targetUser = await this.dataServices.userService.findById({ tenantId, id: targetUserId });

    if (!targetUser || targetUser.isDeleted) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }

    if (targetUser.status !== UserServiceUserStatus.Active) {
      throw new Exception(ErrorCode.USER_ACCOUNT_INACTIVE);
    }

    if (targetUser.type !== UserServiceUserType.OrganizationAdmin) {
      throw new Exception(ErrorCode.INVALID_USER_TYPE);
    }

    if (targetUser.createdBy !== agencyUserId) {
      throw new Exception(ErrorCode.OPERATION_NOT_ALLOWED);
    }

    return true;
  }

  async validateOrganizationAdminCanImpersonate({
    organizationAdminUserId,
    targetUserId,
    tenantId,
  }: {
    organizationAdminUserId: string;
    targetUserId: string;
    tenantId: string;
  }): Promise<boolean> {
    const targetUser = await this.dataServices.userService.findById({ tenantId, id: targetUserId });

    if (!targetUser || targetUser.isDeleted) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }

    if (targetUser.status !== UserServiceUserStatus.Active) {
      throw new Exception(ErrorCode.USER_ACCOUNT_INACTIVE);
    }

    if (targetUser.type !== UserServiceUserType.TenantAdmin) {
      throw new Exception(ErrorCode.INVALID_USER_TYPE);
    }

    if (targetUser.createdBy !== organizationAdminUserId) {
      throw new Exception(ErrorCode.OPERATION_NOT_ALLOWED);
    }

    return true;
  }

  async getUserByAggregate({
    filter,
    skip,
    limit,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter: Record<string, any>;
    skip: number;
    limit: number;
  }): Promise<UserServiceUsersGlqOutput> {
    const pipeline = [
      { $match: filter },
      {
        $facet: {
          data: [{ $sort: { email: 1 } }, { $skip: skip }, { $limit: limit }],
          total: [{ $count: 'count' }],
        },
      },
    ];

    const result = await this.dataServices.userService.aggregate({ pipeline });

    const data = result[0]?.data ?? [];
    const total = result[0]?.total?.[0]?.count ?? 0;
    return this.factoryService.transformMany({
      entities: data,
      total,
    });
  }
}
