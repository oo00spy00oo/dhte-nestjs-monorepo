import { Mutation, Args, Resolver } from '@nestjs/graphql';
import { CurrentTenant } from '@zma-nestjs-monorepo/zma-decorators';

import {
  LarvaCourseServiceCreateSentenceGqlInput,
  LarvaCourseServiceUpdateSentenceGqlInput,
} from '../../core/inputs';
import { SentenceUseCase } from '../../use-cases/sentence/sentence.use-case';

@Resolver()
export class SentenceMutation {
  constructor(private useCase: SentenceUseCase) {}

  @Mutation(() => Boolean)
  async larvaCourseServiceCreateSentence(
    @Args('input') input: LarvaCourseServiceCreateSentenceGqlInput,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    return this.useCase.createSentence({ input, tenantId });
  }

  @Mutation(() => Boolean)
  async larvaCourseServiceUpdateSentence(
    @Args('id') id: string,
    @Args('input') input: LarvaCourseServiceUpdateSentenceGqlInput,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    return this.useCase.updateSentence({ id, input, tenantId });
  }

  @Mutation(() => Boolean)
  async larvaCourseServicePublishSentences(
    @Args('ids', { type: () => [String] }) ids: string[],
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    return this.useCase.publishSentences({ ids, tenantId });
  }
}
