import { Injectable } from '@nestjs/common';

import {
  LarvaCourseServiceTopicOrderGqlOutput,
  LarvaCourseServiceTopicOrdersGqlOutput,
} from '../../core/outputs';
import { TopicOrderEntity } from '../../frameworks/data-services/mongo/entities';

@Injectable()
export class TopicOrderFactoryService {
  transform({ entity }: { entity: TopicOrderEntity }): LarvaCourseServiceTopicOrderGqlOutput {
    const topicOrder: LarvaCourseServiceTopicOrderGqlOutput = {
      id: entity._id,
      categoryCode: entity.categoryCode,
      topicIds: entity.topicIds,
      //   subjectCode: entity.subjectCode,
      //   skillCode: entity.skillCode,
      status: entity.status,
      tenantId: entity.tenantId,
      deletedAt: entity.deletedAt,
      createdAt: entity.createdAt || new Date(),
      updatedAt: entity.updatedAt || new Date(),
    };
    return topicOrder;
  }

  transformMany({
    entities,
    total,
  }: {
    entities: ReturnType<typeof this.transform>[];
    total: number;
  }): LarvaCourseServiceTopicOrdersGqlOutput {
    return {
      data: entities,
      total,
    };
  }
}
