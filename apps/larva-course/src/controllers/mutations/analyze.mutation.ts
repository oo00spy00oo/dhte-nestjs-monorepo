import { Mutation, Args, Resolver } from '@nestjs/graphql';
import { CurrentTenant, CurrentUser } from '@zma-nestjs-monorepo/zma-decorators';
import { AuthenticatedUser } from '@zma-nestjs-monorepo/zma-types';

import { LarvaCourseServiceAnalyzeSpeakingGqlInput } from '../../core/inputs';
import { LarvaCourseServiceAnalyzeGqlOutput } from '../../core/outputs/analyze.output';
import { AnalyzeUseCase } from '../../use-cases/analyze/analyze.use-case';

@Resolver()
export class AnalyzeMutation {
  constructor(private useCase: AnalyzeUseCase) {}

  @Mutation(() => LarvaCourseServiceAnalyzeGqlOutput)
  async larvaCourseServiceAnalyzeSpeakingWord(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: LarvaCourseServiceAnalyzeSpeakingGqlInput,
    @CurrentTenant() tenantId: string,
  ): Promise<LarvaCourseServiceAnalyzeGqlOutput> {
    return this.useCase.analyzeWord({
      userId: user.id,
      input,
      tenantId,
    });
  }

  @Mutation(() => LarvaCourseServiceAnalyzeGqlOutput)
  async larvaCourseServiceAnalyzeSpeakingSentence(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: LarvaCourseServiceAnalyzeSpeakingGqlInput,
    @CurrentTenant() tenantId: string,
  ): Promise<LarvaCourseServiceAnalyzeGqlOutput> {
    return this.useCase.analyzeSentence({
      userId: user.id,
      input,
      tenantId,
    });
  }
}
