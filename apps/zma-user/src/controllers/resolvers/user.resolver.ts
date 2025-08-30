import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import {
  AdminGuard,
  AgencyGuard,
  CurrentTenant,
  CurrentUser,
  GqlAuthGuard,
  OrganizationGuard,
  SkipTenant,
} from '@zma-nestjs-monorepo/zma-decorators';
import { AuthenticatedUser, Pagination } from '@zma-nestjs-monorepo/zma-types';
import {
  UserServiceFindUsersByTypeInput,
  UserServiceFindUsersForAdminInput,
  UserServiceGetZaloUsersGqlInput,
} from '@zma-nestjs-monorepo/zma-types/inputs/user';
import {
  UserServiceUserGqlOutput,
  UserServiceUsersGlqOutput,
} from '@zma-nestjs-monorepo/zma-types/outputs/user/user';

import { UserUseCase } from '../../use-cases/user/user.use-case';

@Resolver()
@UseGuards(GqlAuthGuard)
export class UserResolver {
  constructor(private userUseCase: UserUseCase) {}

  @UseGuards(OrganizationGuard)
  @Query(() => [UserServiceUserGqlOutput])
  async userServiceAllUserOfTenant(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Args('input') pagination: Pagination,
  ): Promise<UserServiceUserGqlOutput[]> {
    return this.userUseCase.getAllUsers({ tenantId, pagination });
  }

  // Admin only
  @UseGuards(AdminGuard)
  @Query(() => UserServiceUsersGlqOutput)
  async userServiceUsersOfTenantForAdmin(
    @CurrentUser() user: AuthenticatedUser,
    @Args('pagination') pagination: Pagination,
    @Args('input', { nullable: true }) input?: UserServiceFindUsersForAdminInput,
  ): Promise<UserServiceUsersGlqOutput> {
    return this.userUseCase.getAllUsersForAdmin({
      tenantIds: user.tenantIds ?? [],
      input,
      pagination,
    });
  }

  @UseGuards(AgencyGuard)
  @SkipTenant()
  @Query(() => UserServiceUsersGlqOutput)
  async userServiceUsersByType(
    @CurrentUser() user: AuthenticatedUser,
    @Args('pagination') pagination: Pagination,
    @Args('input', { nullable: true }) input?: UserServiceFindUsersByTypeInput,
  ): Promise<UserServiceUsersGlqOutput> {
    return this.userUseCase.getAllUsersByType(user, {
      tenantIds: user.tenantIds ?? [],
      input,
      pagination,
      type: input?.type,
    });
  }

  @UseGuards(OrganizationGuard)
  @Query(() => [UserServiceUserGqlOutput])
  async userServiceAllZaloUserOfTenant(
    @Args('input') input: UserServiceGetZaloUsersGqlInput,
    @CurrentTenant() tenantId: string,
  ): Promise<UserServiceUserGqlOutput[]> {
    return this.userUseCase.getAllZaloUsers(input, tenantId);
  }

  @Query(() => UserServiceUserGqlOutput)
  async userServiceGetUserById(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserServiceUserGqlOutput> {
    return this.userUseCase.getUser({ tenantId, id: user.id });
  }

  @Query(() => UserServiceUserGqlOutput)
  async userServiceGetUserByIdForAdmin(
    @CurrentTenant() tenantId: string,
    @Args('id') id: string,
  ): Promise<UserServiceUserGqlOutput> {
    return this.userUseCase.getUserForAdmin({ tenantId, id });
  }
}
