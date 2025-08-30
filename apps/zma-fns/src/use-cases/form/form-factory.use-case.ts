import { Injectable } from '@nestjs/common';

import { FnsServiceFormGqlOutput, FnsServiceFormsGqlOutput } from '../../core/outputs';
import { FormEntity } from '../../frameworks/data-services/mongo/entities';

@Injectable()
export class FormFactoryService {
  transform(entity: FormEntity): FnsServiceFormGqlOutput {
    return {
      _id: entity._id.toString(),
      title: entity.title,
      tenantId: entity.tenantId.toString(),
      description: entity.description,
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

  transformMany({
    entities,
    total,
  }: {
    entities: FormEntity[];
    total: number;
  }): FnsServiceFormsGqlOutput {
    return {
      total,
      data: entities.map((entity) => this.transform(entity)),
    };
  }
}
