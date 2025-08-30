import { UseGuards } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';
import {
  AdminGuard,
  AgencyGuard,
  CurrentTenant,
  CurrentUser,
  GqlAuthGuard,
  SkipTenant,
} from '@zma-nestjs-monorepo/zma-decorators';
import { AuthenticatedUser } from '@zma-nestjs-monorepo/zma-types';
import {
  UserServiceCreateBasicUserGqlInput,
  UserServiceCreateUserGqlInput,
} from '@zma-nestjs-monorepo/zma-types/inputs/user';
import { UserServiceUserGqlOutput } from '@zma-nestjs-monorepo/zma-types/outputs/user/user';

import {
  UpdateAvatarInput,
  UpdateProfileInput,
  UpdateZaloOAIdInput,
} from '../../core/inputs/user.input';
import { UserUseCase } from '../../use-cases/user/user.use-case';

@UseGuards(GqlAuthGuard)
export class UserMutation {
  constructor(private userUseCases: UserUseCase) {}

  @Mutation(() => UserServiceUserGqlOutput)
  async userServiceUpdateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Args('input') input: UpdateProfileInput,
  ): Promise<UserServiceUserGqlOutput> {
    return this.userUseCases.updateProfile({ tenantId, userId: user.id, input });
  }

  @Mutation(() => UserServiceUserGqlOutput)
  async userServiceUpdateAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Args('input') input: UpdateAvatarInput,
  ): Promise<UserServiceUserGqlOutput> {
    return this.userUseCases.updateAvatar({
      tenantId,
      userId: user.id,
      avatarUrl: input.avatarUrl,
    });
  }

  @Mutation(() => UserServiceUserGqlOutput)
  async userServiceUpdateZaloOAId(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Args('input') input: UpdateZaloOAIdInput,
  ): Promise<UserServiceUserGqlOutput> {
    return this.userUseCases.updateZaloOAId({
      tenantId,
      userId: user.id,
      zaloOAId: input.zaloOAId,
    });
  }

  @Mutation(() => UserServiceUserGqlOutput)
  @UseGuards(AgencyGuard)
  @SkipTenant()
  async userServiceCreateOrganizationAdmin(
    @CurrentTenant() tenantId: string,
    @Args('input') input: UserServiceCreateUserGqlInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserServiceUserGqlOutput> {
    return this.userUseCases.createOrganizationAdmin(tenantId, input, user.id);
  }

  @Mutation(() => UserServiceUserGqlOutput)
  @UseGuards(AdminGuard)
  @SkipTenant()
  async userServiceCreateAgency(
    @Args('input') input: UserServiceCreateBasicUserGqlInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserServiceUserGqlOutput> {
    return this.userUseCases.createAgency(input, user.id);
  }

  @Mutation(() => UserServiceUserGqlOutput)
  @UseGuards(AgencyGuard)
  @SkipTenant()
  async userServiceCreateTenantAdmin(
    @CurrentTenant() tenantId: string,
    @Args('input') input: UserServiceCreateUserGqlInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserServiceUserGqlOutput> {
    return this.userUseCases.createTenantAdmin(tenantId, input, user.id);
  }

  @Mutation(() => Boolean)
  async userServiceDeleteUser(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    return this.userUseCases.deleteUser({ tenantId, id: user.id });
  }
}
