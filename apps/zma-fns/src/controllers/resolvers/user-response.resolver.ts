import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentTenant } from '@zma-nestjs-monorepo/zma-decorators';
import { Pagination } from '@zma-nestjs-monorepo/zma-types';
import {
  FnsServiceUserResponseGqlOutput,
  FnsServiceUserResponsesGqlOutput,
} from '@zma-nestjs-monorepo/zma-types/outputs/fns';

import {
  FnsServiceFindUserResponsesToFormGqlInput,
  FnsServiceFindUserResponsesToSurveyGqlInput,
} from '../../core/inputs';
import { UserResponseUseCase } from '../../use-cases/user-response/user-response.use-case';

@Resolver()
export class UserResponseResolver {
  constructor(private userResponseUseCase: UserResponseUseCase) {}
  // Admin only
  @Query(() => FnsServiceUserResponsesGqlOutput)
  async fnsServiceGetUserResponsesToSurveyForAdmin(
    @CurrentTenant() tenantId: string,
    @Args('input') input: FnsServiceFindUserResponsesToSurveyGqlInput,
    @Args('pagination') pagination: Pagination,
  ): Promise<FnsServiceUserResponsesGqlOutput> {
    return this.userResponseUseCase.getUserResponsesToSurveyForAdmin({
      tenantId,
      input,
      pagination,
    });
  }

  // Admin only
  @Query(() => FnsServiceUserResponsesGqlOutput)
  async fnsServiceGetUserResponsesToFormForAdmin(
    @CurrentTenant() tenantId: string,
    @Args('input') input: FnsServiceFindUserResponsesToFormGqlInput,
    @Args('pagination') pagination: Pagination,
  ): Promise<FnsServiceUserResponsesGqlOutput> {
    return this.userResponseUseCase.getUserResponsesToFormForAdmin({ tenantId, input, pagination });
  }

  // Admin only
  @Query(() => FnsServiceUserResponseGqlOutput)
  async fnsServiceGetUserResponseByIdForAdmin(
    @CurrentTenant() tenantId: string,
    @Args('id') id: string,
  ): Promise<FnsServiceUserResponseGqlOutput> {
    return this.userResponseUseCase.getUserResponseByIdForAdmin({ tenantId, id });
  }
}
