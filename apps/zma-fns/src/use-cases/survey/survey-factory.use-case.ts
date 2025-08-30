import { Injectable } from '@nestjs/common';

import { FnsServiceSurveyGqlOutput, FnsServiceSurveysGqlOutput } from '../../core/outputs';
import { SurveyEntity } from '../../frameworks/data-services/mongo/entities';

@Injectable()
export class SurveyFactoryUseCase {
  transformSurvey(entity: SurveyEntity): FnsServiceSurveyGqlOutput {
    return {
      _id: entity._id.toString(),
      title: entity.title,
      tenantId: entity.tenantId.toString(),
      description: entity.description,
      type: entity.type,
      questions: entity.questions.map((question) => ({
        questionId: question.questionId.toString(),
        text: question.text,
        type: question.type,
        options: question.options,
        minValue: question.minValue,
        maxValue: question.maxValue,
        uiTemplate: question.uiTemplate,
        actionLabel: question.actionLabel,
        actionUrl: question.actionUrl,
        isActive: question.isActive,
        isRequired: question.isRequired,
        index: question.index,
      })),
      isActive: entity.isActive,
      isAnonymous: entity.isAnonymous,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  transformManySurvey({
    entities,
    total,
  }: {
    entities: SurveyEntity[];
    total: number;
  }): FnsServiceSurveysGqlOutput {
    return {
      total,
      data: entities.map((entity) => this.transformSurvey(entity)),
    };
  }
}
