import { Injectable } from '@nestjs/common';

import {
  LarvaCourseServiceLessonOrderGqlOutput,
  LarvaCourseServiceLessonOrdersGqlOutput,
} from '../../core/outputs';
import { LessonOrderEntity } from '../../frameworks/data-services/mongo/entities';

@Injectable()
export class LessonOrderFactoryService {
  transform({ entity }: { entity: LessonOrderEntity }): LarvaCourseServiceLessonOrderGqlOutput {
    const lessonOrder: LarvaCourseServiceLessonOrderGqlOutput = {
      id: entity._id,
      topicId: entity.topicId,
      lessonIds: entity.lessonIds,
      status: entity.status,
      tenantId: entity.tenantId,
      deletedAt: entity.deletedAt,
      createdAt: entity.createdAt || new Date(),
      updatedAt: entity.updatedAt || new Date(),
    };
    return lessonOrder;
  }

  transformMany({
    entities,
    total,
  }: {
    entities: ReturnType<typeof this.transform>[];
    total: number;
  }): LarvaCourseServiceLessonOrdersGqlOutput {
    return {
      data: entities,
      total,
    };
  }
}
