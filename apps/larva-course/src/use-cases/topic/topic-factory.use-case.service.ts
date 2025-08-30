import { Injectable } from '@nestjs/common';

import {
  LarvaCourseServiceTopicGqlOutput,
  LarvaCourseServiceTopicsGqlOutput,
} from '../../core/outputs';
import { TopicEntity } from '../../frameworks/data-services/mongo/entities';

@Injectable()
export class TopicFactoryService {
  transform({
    entity,
    totalLessons,
    order,
  }: {
    entity: TopicEntity;
    order?: number;
    totalLessons?: number;
  }): LarvaCourseServiceTopicGqlOutput {
    const topic: LarvaCourseServiceTopicGqlOutput = {
      id: entity._id,
      name: entity.name,
      description: entity.description,
      image: entity.image || null,
      subjectCode: entity.subjectCode,
      skillCode: entity.skillCode,
      categoryCode: entity.categoryCode,
      status: entity.status,
      tenantId: entity.tenantId,
      deletedAt: entity.deletedAt,
      createdAt: entity.createdAt || new Date(),
      updatedAt: entity.updatedAt || new Date(),
      totalLessons: totalLessons || 0,
      order: order || 0,
    };
    return topic;
  }

  transformMany({
    entities,
    total,
  }: {
    entities: ReturnType<typeof this.transform>[];
    total: number;
  }): LarvaCourseServiceTopicsGqlOutput {
    return {
      data: entities,
      total,
    };
  }
}
