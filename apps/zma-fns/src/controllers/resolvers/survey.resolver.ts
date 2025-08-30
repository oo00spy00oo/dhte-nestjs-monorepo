import { Resolver, Query, Args } from '@nestjs/graphql';
import { CurrentTenant } from '@zma-nestjs-monorepo/zma-decorators';
import { Pagination, SurveyType } from '@zma-nestjs-monorepo/zma-types';

import { FnsServiceSurveyGqlOutput, FnsServiceSurveysGqlOutput } from '../../core/outputs';
import { SurveyUseCase } from '../../use-cases/survey/survey.use-case';

@Resolver()
export class SurveyResolver {
  constructor(private surveyUseCase: SurveyUseCase) {}

  // Admin only
  @Query(() => FnsServiceSurveysGqlOutput)
  async fnsServiceGetSurveysForAdmin(
    @CurrentTenant() tenantId: string,
    @Args('pagination') pagination: Pagination,
  ): Promise<FnsServiceSurveysGqlOutput> {
    return this.surveyUseCase.getSurveysForAdmin({ tenantId, pagination });
  }

  @Query(() => FnsServiceSurveyGqlOutput)
  async fnsServiceGetSurveyByType(
    @CurrentTenant() tenantId: string,
    @Args('type', { type: () => SurveyType }) type: SurveyType,
  ): Promise<FnsServiceSurveyGqlOutput> {
    return this.surveyUseCase.getSurveyByType({ tenantId, type });
  }

  @Query(() => FnsServiceSurveyGqlOutput)
  async fnsServiceGetSurveyById(
    @CurrentTenant() tenantId: string,
    @Args('id') id: string,
  ): Promise<FnsServiceSurveyGqlOutput> {
    return this.surveyUseCase.getSurveyById({ tenantId, id });
  }

  @Query(() => FnsServiceSurveyGqlOutput)
  async fnsServiceGetSurveyByIdForAdmin(
    @CurrentTenant() tenantId: string,
    @Args('id') id: string,
  ): Promise<FnsServiceSurveyGqlOutput> {
    return this.surveyUseCase.getSurveyById({ tenantId, id, isAdmin: true });
  }
}
