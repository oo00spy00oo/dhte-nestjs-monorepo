import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import {
  AdminGuard,
  CurrentTenant,
  CurrentUser,
  GqlAuthGuard,
  OrganizationGuard,
  Public,
  SkipTenant,
} from '@zma-nestjs-monorepo/zma-decorators';
import { AuthenticatedUser, Pagination } from '@zma-nestjs-monorepo/zma-types';
import { UserServiceGetTenantsGqlInput } from '@zma-nestjs-monorepo/zma-types/inputs/user';
import { UserServiceTenantGqlOutput } from '@zma-nestjs-monorepo/zma-types/outputs/user/tenant';

import { TenantUseCase } from '../../use-cases/tenant/tenant.use-case';

@Resolver()
@UseGuards(GqlAuthGuard)
export class TenantResolver {
  constructor(private tenantUseCase: TenantUseCase) {}

  @UseGuards(OrganizationGuard)
  @Query(() => [UserServiceTenantGqlOutput])
  @SkipTenant()
  async userServiceAllTenant(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: UserServiceGetTenantsGqlInput,
  ): Promise<UserServiceTenantGqlOutput[]> {
    return this.tenantUseCase.getAllTenant(user.organizationId, input);
  }

  @UseGuards(AdminGuard)
  @Query(() => [UserServiceTenantGqlOutput])
  @SkipTenant()
  async userServiceAdminAllTenant(
    @Args('organizationId') organizationId: string,
    @Args('input') input: Pagination,
  ): Promise<UserServiceTenantGqlOutput[]> {
    return this.tenantUseCase.getAllTenant(organizationId, input);
  }

  @Query(() => UserServiceTenantGqlOutput)
  async userServiceTenantOfUser(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserServiceTenantGqlOutput> {
    return this.tenantUseCase.getTenantByIdForZaloUser(user.tenantIds[0]);
  }

  @Query(() => UserServiceTenantGqlOutput)
  @Public()
  async userServiceTenantById(
    @CurrentTenant() tenantId: string,
  ): Promise<UserServiceTenantGqlOutput> {
    return this.tenantUseCase.getTenantByIdForZaloUser(tenantId);
  }

  @Public()
  @Query(() => String, { nullable: true })
  async userServiceTenantIdFromDomain(@Args('domain') domain: string): Promise<string | null> {
    return this.tenantUseCase.getTenantIdFromDomain(domain);
  }

  @Public()
  @Query(() => UserServiceTenantGqlOutput, { nullable: true })
  async userServiceTenantByDomain(
    @Args('domain') domain: string,
  ): Promise<UserServiceTenantGqlOutput | null> {
    return this.tenantUseCase.getTenantByDomain(domain);
  }
}
