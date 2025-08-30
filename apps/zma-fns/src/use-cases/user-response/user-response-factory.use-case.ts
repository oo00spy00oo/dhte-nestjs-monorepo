import { Injectable } from '@nestjs/common';
import {
  FnsServiceUserResponseGqlOutput,
  FnsServiceUserResponsesGqlOutput,
} from '@zma-nestjs-monorepo/zma-types/outputs/fns';

import { FnsServiceUserResponseFactoryInput } from '../../core/inputs';
@Injectable()
export class UserResponseFactoryUseCase {
  transform({
    entity,
    additionalInput,
  }: FnsServiceUserResponseFactoryInput): FnsServiceUserResponseGqlOutput {
    const { userName, formTitle, surveyTitle, questions } = additionalInput || {};
    const map = questions?.length
      ? new Map(
          questions.map(({ questionId, questionName }) => [questionId.toString(), questionName]),
        )
      : null;

    return {
      id: entity._id.toString(),
      tenantId: entity.tenantId.toString(),
      surveyId: entity.surveyId?.toString(),
      formId: entity.formId?.toString(),
      userId: entity.userId?.toString(),
      userName,
      formTitle,
      surveyTitle,
      ipAddress: entity.ipAddress,
      userAgent: entity.userAgent,
      answers: entity.answers.map(({ questionId, answer }) => ({
        questionId: questionId.toString(),
        answer,
        questionName: map?.get(questionId.toString()),
      })),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  transformMany({
    entities,
    total,
  }: {
    entities: FnsServiceUserResponseFactoryInput[];
    total: number;
  }): FnsServiceUserResponsesGqlOutput {
    return {
      total,
      data: entities.map(({ entity, additionalInput }) =>
        this.transform({ entity, additionalInput }),
      ),
    };
  }
}
