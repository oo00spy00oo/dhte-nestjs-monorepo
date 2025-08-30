import { Mutation, Args, Resolver } from '@nestjs/graphql';
import { CurrentTenant } from '@zma-nestjs-monorepo/zma-decorators';

import {
  LarvaCourseServiceUpdateTopicGqlInput,
  LarvaCourseServiceCreateTopicGqlInput,
} from '../../core/inputs';
import { TopicUseCase } from '../../use-cases/topic/topic.use-case';

@Resolver()
export class TopicMutation {
  constructor(private useCase: TopicUseCase) {}

  @Mutation(() => Boolean)
  async larvaCourseServiceCreateTopic(
    @Args('input') input: LarvaCourseServiceCreateTopicGqlInput,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    return this.useCase.createTopic({ input, tenantId });
  }

  @Mutation(() => Boolean)
  async larvaCourseServiceUpdateTopic(
    @Args('id') id: string,
    @Args('input') input: LarvaCourseServiceUpdateTopicGqlInput,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    return this.useCase.updateTopic({ id, input, tenantId });
  }
}
