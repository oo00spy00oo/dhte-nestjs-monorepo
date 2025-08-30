import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentTenant, GqlAuthGuard, Public } from '@zma-nestjs-monorepo/zma-decorators';
import { Pagination } from '@zma-nestjs-monorepo/zma-types';

import { FnsServiceFormGqlOutput, FnsServiceFormsGqlOutput } from '../../core/outputs';
import { FormUseCase } from '../../use-cases/form/form.use-case';

@Resolver()
@UseGuards(GqlAuthGuard)
export class FormResolver {
  constructor(private formUseCase: FormUseCase) {}

  // Admin only
  @Query(() => FnsServiceFormsGqlOutput)
  async fnsServiceGetFormsForAdmin(
    @CurrentTenant() tenantId: string,
    @Args('pagination') pagination: Pagination,
  ): Promise<FnsServiceFormsGqlOutput> {
    return this.formUseCase.getFormsForAdmin({ tenantId, pagination });
  }

  @Query(() => FnsServiceFormGqlOutput)
  @Public()
  async fnsServiceGetFormById(
    @CurrentTenant() tenantId: string,
    @Args('id') id: string,
  ): Promise<FnsServiceFormGqlOutput> {
    return this.formUseCase.getFormById({ tenantId, id });
  }

  @Query(() => FnsServiceFormGqlOutput)
  async fnsServiceGetFormByIdForAdmin(
    @CurrentTenant() tenantId: string,
    @Args('id') id: string,
  ): Promise<FnsServiceFormGqlOutput> {
    return this.formUseCase.getFormById({ tenantId, id, isAdmin: true });
  }
}
