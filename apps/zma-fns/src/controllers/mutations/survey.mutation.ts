import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentTenant } from '@zma-nestjs-monorepo/zma-decorators';

import { FnsServiceCreateSurveyGqlInput, FnsServiceUpdateSurveyGqlInput } from '../../core/inputs';
import { FnsServiceSurveyGqlOutput } from '../../core/outputs';
import { SurveyUseCase } from '../../use-cases/survey/survey.use-case';

@Resolver()
export class SurveyMutation {
  constructor(private surveyUseCase: SurveyUseCase) {}

  // Admin only
  @Mutation(() => FnsServiceSurveyGqlOutput)
  async fnsServiceCreateSurveyForAdmin(
    @CurrentTenant() tenantId: string,
    @Args('input') input: FnsServiceCreateSurveyGqlInput,
  ): Promise<FnsServiceSurveyGqlOutput> {
    return this.surveyUseCase.createSurveyForAdmin({ tenantId, input });
  }

  // Admin only
  @Mutation(() => FnsServiceSurveyGqlOutput)
  async fnsServiceUpdateSurveyForAdmin(
    @CurrentTenant() tenantId: string,
    @Args('id') id: string,
    @Args('input') input: FnsServiceUpdateSurveyGqlInput,
  ): Promise<FnsServiceSurveyGqlOutput> {
    return this.surveyUseCase.updateSurveyForAdmin({ tenantId, id, input });
  }
}
