import { Injectable } from '@nestjs/common';
import { Exception } from '@zma-nestjs-monorepo/zma-middlewares';
import { Pagination } from '@zma-nestjs-monorepo/zma-types';
import mongoose from 'mongoose';

import { larvaCourseServiceSubjects } from '../../configuration/course';
import { IDataServices } from '../../core/abstracts';
import {
  LarvaCourseServiceCreateTopicGqlInput,
  LarvaCourseServiceSearchTopicGqlInput,
  LarvaCourseServiceUpdateTopicGqlInput,
} from '../../core/inputs';
import {
  LarvaCourseServiceTopicGqlOutput,
  LarvaCourseServiceTopicsGqlOutput,
} from '../../core/outputs';
import { LarvaCourseServiceCourseStatus } from '../../core/types';
import { TopicEntity } from '../../frameworks/data-services/mongo/entities';
import { TopicOrderUseCase } from '../topic-order/topic-order.use-case';

import { TopicFactoryService } from './topic-factory.use-case.service';

@Injectable()
export class TopicUseCase {
  constructor(
    private dataServices: IDataServices,
    private factoryService: TopicFactoryService,
    private topicOrderService: TopicOrderUseCase,
  ) {}

  async getTopicById({
    id,
    tenantId,
  }: {
    id: string;
    tenantId: string;
  }): Promise<LarvaCourseServiceTopicGqlOutput> {
    const entity = await this.dataServices.topicService.findById({ id, tenantId });

    if (!entity) {
      throw new Exception('Topic not found');
    }

    return this.factoryService.transform({ entity });
  }

  async getTopicsByIds({
    ids,
    pagination,
    tenantId,
  }: {
    ids: string[];
    pagination: Pagination;
    tenantId: string;
  }): Promise<LarvaCourseServiceTopicGqlOutput[]> {
    const { skip, limit } = pagination;
    const entities = await this.dataServices.topicService.findMany({
      tenantId,
      find: {
        filter: {
          _id: { $in: ids },
        },
      },
      options: {
        sort: { createdAt: -1 },
        limit,
        skip,
      },
    });
    return entities.map((entity) => this.factoryService.transform({ entity }));
  }

  async searchTopics({
    input,
    pagination,
    tenantId,
  }: {
    input: LarvaCourseServiceSearchTopicGqlInput;
    pagination: Pagination;
    tenantId: string;
  }): Promise<LarvaCourseServiceTopicsGqlOutput> {
    const { limit, skip } = pagination;
    const { categoryCode } = input;

    const categoryMatch = larvaCourseServiceSubjects.find((subject) =>
      subject.skills.find((skill) =>
        skill.categories.find((category) => category.code === categoryCode),
      ),
    );
    if (!categoryMatch) {
      throw new Exception('Category does not match');
    }

    let filter: any = {
      tenantId: new mongoose.Types.UUID(tenantId),
    };

    filter = Object.keys(input).reduce((acc, key) => {
      if (input[key]) {
        if (key === 'name') {
          acc.name = { $regex: input[key], $options: 'i' };
        } else {
          acc[key] = input[key];
        }
      }
      return acc;
    }, filter);

    // Get topic order for the category if specified
    let topicIds: string[] = [];
    if (categoryCode) {
      try {
        const topicOrder = await this.dataServices.topicOrderService.findOne({
          tenantId,
          find: {
            filter: {
              categoryCode,
              status: LarvaCourseServiceCourseStatus.Active,
            },
          },
        });
        topicIds = topicOrder?.topicIds || [];
      } catch (error) {
        // If topic order service is not available, continue without ordering
        console.warn('Topic order service not available, using default ordering');
      }
    }

    const pipeline: any[] = [
      { $match: filter },
      {
        $lookup: {
          from: 'lessons',
          localField: '_id',
          foreignField: 'topicId',
          as: 'lessons',
        },
      },
      {
        $addFields: {
          totalLessons: { $size: '$lessons' },
        },
      },
      {
        $project: {
          lessons: 0,
        },
      },
    ];
    // Add ordering based on topic order if available
    if (topicIds.length > 0) {
      pipeline.push({
        $addFields: {
          order: {
            $add: [{ $indexOfArray: [topicIds, '$_id'] }, 1],
          },
        },
      });
      pipeline.push({
        $sort: {
          order: 1,
          createdAt: -1,
        },
      });
    } else {
      pipeline.push({
        $sort: { createdAt: -1 },
      });
    }

    pipeline.push({
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: 'count' }],
      },
    });

    const entities = await this.dataServices.topicService.aggregate({
      pipeline,
    });
    const topics = (entities[0]?.data ?? []).map((topic) =>
      this.factoryService.transform({
        entity: topic,
        totalLessons: topic.totalLessons,
        order: topic.order,
      }),
    );

    return this.factoryService.transformMany({
      entities: topics,
      total: entities[0]?.total?.[0]?.count ?? 0,
    });
  }

  async createTopic({
    tenantId,
    input,
  }: {
    tenantId: string;
    input: LarvaCourseServiceCreateTopicGqlInput;
  }): Promise<boolean> {
    // Optimized: Find category, skill, and subject by categoryCode in a single pass
    let foundCategory, foundSkill, foundSubject;
    larvaCourseServiceSubjects.some((subject) => {
      if (subject.status !== LarvaCourseServiceCourseStatus.Active || !subject.skills) return false;
      return subject.skills.some((skill) => {
        if (skill.status !== LarvaCourseServiceCourseStatus.Active || !skill.categories)
          return false;
        const category = skill.categories.find(
          (cat) =>
            cat.code === input.categoryCode && cat.status === LarvaCourseServiceCourseStatus.Active,
        );
        if (category) {
          foundCategory = category;
          foundSkill = skill;
          foundSubject = subject;
          return true;
        }
        return false;
      });
    });
    if (!foundCategory) {
      throw new Exception('Category not found');
    }
    if (!foundSkill) {
      throw new Exception('Skill not found');
    }
    if (!foundSubject) {
      throw new Exception('Subject not found');
    }

    const newTopic = {
      ...input,
      tenantId,
      status: LarvaCourseServiceCourseStatus.Active,
      subjectCode: foundSubject.code,
      skillCode: foundSkill.code,
    };

    const entity = await this.dataServices.topicService.create({
      item: newTopic,
      tenantId,
    });

    await this.insertTopicToTopicOrder({
      tenantId,
      categoryCode: foundCategory.code,
      entity,
      order: input.order,
    });

    return !!entity;
  }

  async updateTopic({
    tenantId,
    id,
    input,
  }: {
    tenantId: string;
    id: string;
    input: LarvaCourseServiceUpdateTopicGqlInput;
  }): Promise<boolean> {
    const existingTopic = await this.dataServices.topicService.findOne({
      tenantId,
      find: {
        filter: { _id: id },
      },
    });

    if (!existingTopic) {
      throw new Exception('Topic not found');
    }

    const entity = await this.dataServices.topicService.updateOne({
      tenantId,
      id,
      update: { item: input },
    });

    if (input.order)
      await this.insertTopicToTopicOrder({
        tenantId,
        categoryCode: existingTopic.categoryCode,
        entity,
        order: input.order,
      });

    return !!entity;
  }

  private async insertTopicToTopicOrder({
    tenantId,
    categoryCode,
    entity,
    order,
  }: {
    tenantId: string;
    categoryCode: string;
    entity: TopicEntity;
    order: number;
  }): Promise<void> {
    // Get topic order for the category if specified
    const topicOrder = await this.dataServices.topicOrderService.findOne({
      tenantId,
      find: {
        filter: {
          categoryCode,
          status: LarvaCourseServiceCourseStatus.Active,
        },
      },
    });

    // Insert the new topic at the correct position based on the input order,
    // Remove entity._id if it already exists to avoid duplicates.
    // If topicOrderEntity is not found, create a new one with the topicIds array containing only the new topic.
    const topicIds = topicOrder
      ? [...topicOrder.topicIds.filter((id) => String(id) !== String(entity._id))]
      : [];

    if (topicOrder) {
      const insertIndex = Math.max(0, Math.min(order - 1, topicIds.length));
      topicIds.splice(insertIndex, 0, entity._id);
    } else {
      topicIds.push(entity._id);
    }
    await this.topicOrderService.createOrUpdateTopicOrder({
      tenantId,
      input: {
        categoryCode,
        topicIds,
      },
    });
  }
}
