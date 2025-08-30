import { Injectable } from '@nestjs/common';
import { Exception } from '@zma-nestjs-monorepo/zma-middlewares';
import { ErrorCode, Pagination, SurveyType } from '@zma-nestjs-monorepo/zma-types';
import mongoose from 'mongoose';

import { IDataServices } from '../../core';
import { FnsServiceCreateSurveyGqlInput, FnsServiceUpdateSurveyGqlInput } from '../../core/inputs';
import { FnsServiceSurveyGqlOutput, FnsServiceSurveysGqlOutput } from '../../core/outputs';

import { SurveyFactoryUseCase } from './survey-factory.use-case';

@Injectable()
export class SurveyUseCase {
  constructor(
    private surveyFactoryUseCase: SurveyFactoryUseCase,
    private dataService: IDataServices,
  ) {}

  async createSurveyForAdmin({
    tenantId,
    input,
  }: {
    tenantId: string;
    input: FnsServiceCreateSurveyGqlInput;
  }): Promise<FnsServiceSurveyGqlOutput> {
    const entity = await this.dataService.surveyService.create({
      tenantId,
      item: input,
    });
    if (!entity) {
      throw new Exception(ErrorCode.CREATE_SURVEY_FAILED);
    }
    return this.surveyFactoryUseCase.transformSurvey(entity);
  }

  async getSurveysForAdmin({
    tenantId,
    pagination,
  }: {
    tenantId: string;
    pagination: Pagination;
  }): Promise<FnsServiceSurveysGqlOutput> {
    const { skip, limit } = pagination;
    const filter = {
      tenantId: new mongoose.Types.UUID(tenantId),
    };
    const pipeline = [
      { $match: filter },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }, { $sort: { createdAt: -1 } }],
          total: [{ $count: 'count' }],
        },
      },
    ];
    const result = await this.dataService.surveyService.aggregate({ pipeline });
    const data = result[0]?.data ?? [];
    const total = result[0]?.total?.[0]?.count ?? 0;
    return this.surveyFactoryUseCase.transformManySurvey({
      entities: data,
      total,
    });
  }

  async getSurveyByType({
    tenantId,
    type,
  }: {
    tenantId: string;
    type: SurveyType;
  }): Promise<FnsServiceSurveyGqlOutput> {
    const entity = await this.dataService.surveyService.findOne({
      tenantId,
      find: {
        filter: {
          isActive: true,
          type,
          isDeleted: false,
        },
      },
    });
    if (!entity) {
      throw new Exception(ErrorCode.SURVEY_NOT_FOUND);
    }
    const filteredQuestions = entity?.questions.filter((question) => question.isActive);
    entity.questions = filteredQuestions;
    return this.surveyFactoryUseCase.transformSurvey(entity);
  }

  async getSurveyById({
    tenantId,
    id,
    isAdmin = false,
  }: {
    tenantId: string;
    id: string;
    isAdmin?: boolean;
  }): Promise<FnsServiceSurveyGqlOutput> {
    const entity = await this.dataService.surveyService.findOne({
      tenantId,
      find: {
        filter: {
          _id: id,
          ...(isAdmin ? {} : { isActive: true, isDeleted: false }),
        },
      },
    });
    if (!entity) {
      throw new Exception(ErrorCode.SURVEY_NOT_FOUND);
    }
    const filteredQuestions = entity?.questions.filter((question) => question.isActive);
    entity.questions = filteredQuestions;
    return this.surveyFactoryUseCase.transformSurvey(entity);
  }

  async updateSurveyForAdmin({
    tenantId,
    id,
    input,
  }: {
    tenantId: string;
    id: string;
    input: FnsServiceUpdateSurveyGqlInput;
  }): Promise<FnsServiceSurveyGqlOutput> {
    const existingSurvey = await this.dataService.surveyService.findById({
      tenantId,
      id,
    });
    if (!existingSurvey) {
      throw new Exception(ErrorCode.SURVEY_NOT_FOUND);
    }
    const updatedEntity = await this.dataService.surveyService.updateOne({
      tenantId,
      id,
      update: {
        item: input,
      },
    });
    if (!updatedEntity) {
      throw new Exception(ErrorCode.UPDATE_SURVEY_FAILED);
    }
    return this.surveyFactoryUseCase.transformSurvey(updatedEntity);
  }
}
