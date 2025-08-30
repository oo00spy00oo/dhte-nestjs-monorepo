import { Injectable } from '@nestjs/common';
import { Exception } from '@zma-nestjs-monorepo/zma-middlewares';
import { Pagination } from '@zma-nestjs-monorepo/zma-types';
import mongoose from 'mongoose';

import { larvaCourseServiceSubjects } from '../../configuration';
import { IDataServices } from '../../core/abstracts';
import {
  LarvaCourseServiceCreateLessonOrderGqlInput,
  LarvaCourseServiceSearchLessonOrderGqlInput,
  LarvaCourseServiceUpdateLessonOrderGqlInput,
} from '../../core/inputs';
import {
  LarvaCourseServiceLessonOrderGqlOutput,
  LarvaCourseServiceLessonOrdersGqlOutput,
} from '../../core/outputs';
import { LarvaCourseServiceCourseStatus } from '../../core/types';
import { LessonOrderEntity } from '../../frameworks/data-services/mongo/entities';

import { LessonOrderFactoryService } from './lesson-order-factory.use-case.service';

@Injectable()
export class LessonOrderUseCase {
  constructor(
    private dataServices: IDataServices,
    private factoryService: LessonOrderFactoryService,
  ) {}

  async getLessonOrderById({
    id,
    tenantId,
  }: {
    id: string;
    tenantId: string;
  }): Promise<LarvaCourseServiceLessonOrderGqlOutput> {
    const entity = await this.dataServices.lessonOrderService.findById({ id, tenantId });

    if (!entity) {
      throw new Exception('Lesson order not found');
    }

    return this.factoryService.transform({ entity });
  }

  async searchLessonOrders({
    input,
    pagination,
    tenantId,
  }: {
    input: LarvaCourseServiceSearchLessonOrderGqlInput;
    pagination: Pagination;
    tenantId: string;
  }): Promise<LarvaCourseServiceLessonOrdersGqlOutput> {
    const { limit, skip } = pagination;
    const { topicId } = input;

    const filter: any = {
      tenantId: new mongoose.Types.UUID(tenantId),
      topicId: new mongoose.Types.UUID(topicId),
    };

    const pipeline = [
      { $match: filter },
      {
        $facet: {
          data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }],
          total: [{ $count: 'count' }],
        },
      },
    ];

    const entities = await this.dataServices.lessonOrderService.aggregate({
      pipeline,
    });

    const lessonOrders = (entities[0]?.data ?? []).map((entity) =>
      this.factoryService.transform({ entity }),
    );

    return this.factoryService.transformMany({
      entities: lessonOrders,
      total: entities[0]?.total?.[0]?.count ?? 0,
    });
  }

  async createOrUpdateLessonOrder({
    tenantId,
    input,
  }: {
    tenantId: string;
    input: LarvaCourseServiceCreateLessonOrderGqlInput;
  }): Promise<boolean> {
    // Optionally, validate that the topic exists in the configuration or DB
    // For now, just proceed

    // Check if lesson order already exists for this topic
    const existingOrder = await this.dataServices.lessonOrderService.findOne({
      tenantId,
      find: {
        filter: {
          topicId: input.topicId,
        },
      },
    });

    if (existingOrder) {
      const entity = await this.dataServices.lessonOrderService.updateOne({
        tenantId,
        id: existingOrder._id,
        update: { item: input },
      });
      return !!entity;
    }

    const newLessonOrder = {
      ...input,
      tenantId,
      status: input.status || LarvaCourseServiceCourseStatus.Active,
    };

    const entity = await this.dataServices.lessonOrderService.create({
      item: newLessonOrder,
      tenantId,
    });

    return !!entity;
  }

  async getOrderedLessonsByTopic({
    topicId,
    tenantId,
  }: {
    topicId: string;
    tenantId: string;
  }): Promise<string[]> {
    const lessonOrder = await this.dataServices.lessonOrderService.findOne({
      tenantId,
      find: {
        filter: {
          topicId,
          status: LarvaCourseServiceCourseStatus.Active,
        },
      },
    });

    return lessonOrder?.lessonIds || [];
  }
}
