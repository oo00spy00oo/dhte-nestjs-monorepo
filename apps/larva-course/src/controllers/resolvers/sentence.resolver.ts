import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentTenant } from '@zma-nestjs-monorepo/zma-decorators';
import { Pagination } from '@zma-nestjs-monorepo/zma-types';

import { LarvaCourseServiceSearchSentenceGqlInput } from '../../core/inputs';
import {
  LarvaCourseServiceSentenceGqlOutput,
  LarvaCourseServiceSentencesGqlOutput,
} from '../../core/outputs';
import { SentenceUseCase } from '../../use-cases/sentence/sentence.use-case';

@Resolver()
export class SentenceResolver {
  constructor(private useCase: SentenceUseCase) {}

  @Query(() => LarvaCourseServiceSentenceGqlOutput)
  async larvaCourseServiceSentence(
    @Args('id') id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<LarvaCourseServiceSentenceGqlOutput> {
    return this.useCase.getSentence({ id, tenantId });
  }

  @Query(() => [LarvaCourseServiceSentenceGqlOutput])
  async larvaCourseServiceSentences(
    @Args('ids', { type: () => [String] }) ids: string[],
    @Args('pagination') pagination: Pagination,
    @CurrentTenant() tenantId: string,
  ): Promise<LarvaCourseServiceSentenceGqlOutput[]> {
    return this.useCase.getSentences({ ids, pagination, tenantId });
  }

  @Query(() => [LarvaCourseServiceSentenceGqlOutput])
  async larvaCourseServiceAllSentences(
    @Args('pagination') pagination: Pagination,
    @CurrentTenant() tenantId: string,
  ): Promise<LarvaCourseServiceSentenceGqlOutput[]> {
    return this.useCase.getAllSentences({ pagination, tenantId });
  }

  @Query(() => LarvaCourseServiceSentencesGqlOutput)
  async larvaCourseServiceSearchSentences(
    @Args('input') input: LarvaCourseServiceSearchSentenceGqlInput,
    @Args('pagination') pagination: Pagination,
    @CurrentTenant() tenantId: string,
  ): Promise<LarvaCourseServiceSentencesGqlOutput> {
    return this.useCase.searchSentences({ input, pagination, tenantId });
  }
}
