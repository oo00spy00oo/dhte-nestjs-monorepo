import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentTenant, CurrentUser } from '@zma-nestjs-monorepo/zma-decorators';
import { AuthenticatedUser, Pagination } from '@zma-nestjs-monorepo/zma-types';

import {
  LarvaCourseServiceGetNearlyLessonsGqlInput,
  LarvaCourseServiceSearchLessonGqlInput,
  LarvaCourseServiceSearchLessonSentenceGqlInput,
  LarvaCourseServiceSearchLessonWordGqlInput,
} from '../../core/inputs';
import {
  LarvaCourseServiceLessonGqlOutput,
  LarvaCourseServiceLessonsGqlOutput,
  LarvaCourseServiceSearchLessonWordGqlOutput,
  LarvaCourseServiceSearchLessonSentenceGqlOutput,
  LarvaCourseServiceHistoryLessonGqlOutput,
} from '../../core/outputs';
import { LessonUseCase } from '../../use-cases/lesson/lesson.use-case';

@Resolver()
export class LessonResolver {
  constructor(private useCase: LessonUseCase) {}

  @Query(() => LarvaCourseServiceLessonGqlOutput)
  async larvaCourseServiceLessonById(
    @Args('id') id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<LarvaCourseServiceLessonGqlOutput> {
    return this.useCase.getLessonById({ id, tenantId });
  }

  @Query(() => [LarvaCourseServiceLessonGqlOutput])
  async larvaCourseServiceLessonsByIds(
    @Args('ids', { type: () => [String] }) ids: string[],
    @Args('pagination') pagination: Pagination,
    @CurrentTenant() tenantId: string,
  ): Promise<LarvaCourseServiceLessonGqlOutput[]> {
    return this.useCase.getLessonsByIds({ ids, pagination, tenantId });
  }

  @Query(() => LarvaCourseServiceLessonsGqlOutput)
  async larvaCourseServiceSearchLessonsSpeaking(
    @Args('input') input: LarvaCourseServiceSearchLessonGqlInput,
    @Args('pagination') pagination: Pagination,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<LarvaCourseServiceLessonsGqlOutput> {
    return this.useCase.searchLessonsSpeaking({ input, pagination, tenantId, userId: user.id });
  }

  @Query(() => LarvaCourseServiceLessonGqlOutput)
  async larvaCourseServiceLessonSpeakingById(
    @Args('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<LarvaCourseServiceLessonGqlOutput> {
    return this.useCase.getLessonSpeakingById({ id, tenantId, userId: user.id });
  }

  @Query(() => [LarvaCourseServiceLessonGqlOutput])
  async larvaCourseServiceGetNearlyLessons(
    @Args('input') input: LarvaCourseServiceGetNearlyLessonsGqlInput,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<LarvaCourseServiceLessonGqlOutput[]> {
    return this.useCase.getNearlyLessons({ input, tenantId, userId: user.id });
  }

  @Query(() => [LarvaCourseServiceSearchLessonWordGqlOutput])
  async larvaCourseServiceGetLessonWords(
    @Args('input') input: LarvaCourseServiceSearchLessonWordGqlInput,
    @Args('pagination') pagination: Pagination,
    @CurrentTenant() tenantId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<LarvaCourseServiceSearchLessonWordGqlOutput[]> {
    return this.useCase.searchLessonWords({ input, pagination, tenantId, userId: currentUser.id });
  }

  @Query(() => [LarvaCourseServiceSearchLessonSentenceGqlOutput])
  async larvaCourseServiceGetLessonSentences(
    @Args('input') input: LarvaCourseServiceSearchLessonSentenceGqlInput,
    @Args('pagination') pagination: Pagination,
    @CurrentTenant() tenantId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<LarvaCourseServiceSearchLessonSentenceGqlOutput[]> {
    return this.useCase.searchLessonSentences({
      input,
      pagination,
      tenantId,
      userId: currentUser.id,
    });
  }

  @Query(() => LarvaCourseServiceHistoryLessonGqlOutput)
  async larvaCourseServiceGetLessonSpeakingSummary(
    @Args('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<LarvaCourseServiceHistoryLessonGqlOutput> {
    return this.useCase.getLessonSpeakingSummary({
      lessonId: id,
      tenantId,
      userId: currentUser.id,
    });
  }
}
