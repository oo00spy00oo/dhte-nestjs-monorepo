import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentTenant } from '@zma-nestjs-monorepo/zma-decorators';
import { Pagination } from '@zma-nestjs-monorepo/zma-types';

import { LarvaCourseServiceSearchTopicGqlInput } from '../../core/inputs';
import {
  LarvaCourseServiceTopicGqlOutput,
  LarvaCourseServiceTopicsGqlOutput,
} from '../../core/outputs';
import { TopicUseCase } from '../../use-cases/topic/topic.use-case';

@Resolver()
export class TopicResolver {
  constructor(private useCase: TopicUseCase) {}

  @Query(() => LarvaCourseServiceTopicGqlOutput)
  async larvaCourseServiceTopicById(
    @Args('id') id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<LarvaCourseServiceTopicGqlOutput> {
    return this.useCase.getTopicById({ id, tenantId });
  }

  @Query(() => [LarvaCourseServiceTopicGqlOutput])
  async larvaCourseServiceTopicsByIds(
    @Args('ids', { type: () => [String] }) ids: string[],
    @Args('pagination') pagination: Pagination,
    @CurrentTenant() tenantId: string,
  ): Promise<LarvaCourseServiceTopicGqlOutput[]> {
    return this.useCase.getTopicsByIds({ ids, pagination, tenantId });
  }

  @Query(() => LarvaCourseServiceTopicsGqlOutput)
  async larvaCourseServiceSearchTopics(
    @Args('input') input: LarvaCourseServiceSearchTopicGqlInput,
    @Args('pagination') pagination: Pagination,
    @CurrentTenant() tenantId: string,
  ): Promise<LarvaCourseServiceTopicsGqlOutput> {
    return this.useCase.searchTopics({ input, pagination, tenantId });
  }
}
