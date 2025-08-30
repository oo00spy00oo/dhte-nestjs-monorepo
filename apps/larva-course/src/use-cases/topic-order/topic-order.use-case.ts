import { Injectable } from '@nestjs/common';
import { Exception } from '@zma-nestjs-monorepo/zma-middlewares';
import { Pagination } from '@zma-nestjs-monorepo/zma-types';
import mongoose from 'mongoose';

import { larvaCourseServiceSubjects } from '../../configuration';
import { IDataServices } from '../../core/abstracts';
import {
  LarvaCourseServiceCreateTopicOrderGqlInput,
  LarvaCourseServiceSearchTopicOrderGqlInput,
  LarvaCourseServiceUpdateTopicOrderGqlInput,
} from '../../core/inputs';
import {
  LarvaCourseServiceTopicOrderGqlOutput,
  LarvaCourseServiceTopicOrdersGqlOutput,
} from '../../core/outputs';
import { LarvaCourseServiceCourseStatus } from '../../core/types';
import { TopicOrderEntity } from '../../frameworks/data-services/mongo/entities';

import { TopicOrderFactoryService } from './topic-order-factory.use-case.service';

@Injectable()
export class TopicOrderUseCase {
  constructor(
    private dataServices: IDataServices,
    private factoryService: TopicOrderFactoryService,
  ) {}

  async getTopicOrderById({
    id,
    tenantId,
  }: {
    id: string;
    tenantId: string;
  }): Promise<LarvaCourseServiceTopicOrderGqlOutput> {
    const entity = await this.dataServices.topicOrderService.findById({ id, tenantId });

    if (!entity) {
      throw new Exception('Topic order not found');
    }

    return this.factoryService.transform({ entity });
  }

  async searchTopicOrders({
    input,
    pagination,
    tenantId,
  }: {
    input: LarvaCourseServiceSearchTopicOrderGqlInput;
    pagination: Pagination;
    tenantId: string;
  }): Promise<LarvaCourseServiceTopicOrdersGqlOutput> {
    const { limit, skip } = pagination;
    const { categoryCode } = input;

    // Validate category code
    if (categoryCode) {
      const categoryMatch = larvaCourseServiceSubjects.find((subject) =>
        subject.skills.find((skill) =>
          skill.categories.find((category) => category.code === categoryCode),
        ),
      );
      if (!categoryMatch) {
        throw new Exception('Category does not match');
      }
    }

    let filter: any = {
      tenantId: new mongoose.Types.UUID(tenantId),
    };

    filter = Object.keys(input).reduce((acc, key) => {
      if (input[key]) {
        acc[key] = input[key];
      }
      return acc;
    }, filter);

    const pipeline = [
      { $match: filter },
      {
        $facet: {
          data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }],
          total: [{ $count: 'count' }],
        },
      },
    ];

    const entities = await this.dataServices.topicOrderService.aggregate({
      pipeline,
    });

    const topicOrders = (entities[0]?.data ?? []).map((entity) =>
      this.factoryService.transform({ entity }),
    );

    return this.factoryService.transformMany({
      entities: topicOrders,
      total: entities[0]?.total?.[0]?.count ?? 0,
    });
  }

  async createOrUpdateTopicOrder({
    tenantId,
    input,
  }: {
    tenantId: string;
    input: LarvaCourseServiceCreateTopicOrderGqlInput;
  }): Promise<boolean> {
    // Validate that the category exists in the configuration
    const categoryMatch = larvaCourseServiceSubjects.find((subject) =>
      subject.skills.find((skill) =>
        skill.categories.find((category) => category.code === input.categoryCode),
      ),
    );

    if (!categoryMatch) {
      throw new Exception('Category not found in configuration');
    }

    // Check if topic order already exists for this category
    const existingOrder = await this.dataServices.topicOrderService.findOne({
      tenantId,
      find: {
        filter: {
          categoryCode: input.categoryCode,
        },
      },
    });

    if (existingOrder) {
      const entity = await this.dataServices.topicOrderService.updateOne({
        tenantId,
        id: existingOrder._id,
        update: { item: input },
      });
      return !!entity;
    }

    const newTopicOrder = {
      ...input,
      tenantId,
      status: input.status || LarvaCourseServiceCourseStatus.Active,
    };

    const entity = await this.dataServices.topicOrderService.create({
      item: newTopicOrder,
      tenantId,
    });

    return !!entity;
  }

  async getOrderedTopicsByCategory({
    categoryCode,
    tenantId,
  }: {
    categoryCode: string;
    tenantId: string;
  }): Promise<string[]> {
    const topicOrder = await this.dataServices.topicOrderService.findOne({
      tenantId,
      find: {
        filter: {
          categoryCode,
          status: LarvaCourseServiceCourseStatus.Active,
        },
      },
    });

    return topicOrder?.topicIds || [];
  }
}
