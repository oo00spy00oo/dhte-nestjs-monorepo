import { UseGuards } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';
import {
  AdminGuard,
  CurrentUser,
  GqlAuthGuard,
  OrganizationGuard,
  SkipTenant,
} from '@zma-nestjs-monorepo/zma-decorators';
import { AuthenticatedUser } from '@zma-nestjs-monorepo/zma-types';
import {
  UserServiceCreateTenantGqlInput,
  UserServiceTenantStatusGqlInput,
  UserServiceTenantTypeGqlInput,
  UserServiceUpdateTenantGqlInput,
} from '@zma-nestjs-monorepo/zma-types/inputs/user';
import { UserServiceTenantGqlOutput } from '@zma-nestjs-monorepo/zma-types/outputs/user/tenant';

import { TenantUseCase } from '../../use-cases/tenant/tenant.use-case';

@UseGuards(GqlAuthGuard)
export class TenantMutation {
  constructor(private tenantUseCases: TenantUseCase) {}

  @UseGuards(OrganizationGuard)
  @Mutation(() => UserServiceTenantGqlOutput)
  @SkipTenant()
  async userServiceCreateTenant(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: UserServiceCreateTenantGqlInput,
  ): Promise<UserServiceTenantGqlOutput> {
    return this.tenantUseCases.createTenant(user.organizationId, input);
  }

  @UseGuards(OrganizationGuard)
  @Mutation(() => UserServiceTenantGqlOutput)
  @SkipTenant()
  async userServiceUpdateTenant(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: UserServiceUpdateTenantGqlInput,
  ): Promise<UserServiceTenantGqlOutput> {
    return this.tenantUseCases.updateTenant(user.organizationId, input);
  }

  @UseGuards(OrganizationGuard)
  @Mutation(() => UserServiceTenantGqlOutput)
  @SkipTenant()
  async userServiceTenantStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: UserServiceTenantStatusGqlInput,
  ): Promise<UserServiceTenantGqlOutput> {
    return this.tenantUseCases.tenantStatus(user.organizationId, input);
  }

  @UseGuards(AdminGuard)
  @Mutation(() => UserServiceTenantGqlOutput)
  @SkipTenant()
  async userServiceUpdateTenantType(
    @Args('input') input: UserServiceTenantTypeGqlInput,
  ): Promise<UserServiceTenantGqlOutput> {
    return this.tenantUseCases.updateTenantType(input);
  }
}
