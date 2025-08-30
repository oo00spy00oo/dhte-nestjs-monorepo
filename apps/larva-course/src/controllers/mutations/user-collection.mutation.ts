import { Mutation, Args, Resolver } from '@nestjs/graphql';
import { CurrentTenant, CurrentUser } from '@zma-nestjs-monorepo/zma-decorators';
import { AuthenticatedUser } from '@zma-nestjs-monorepo/zma-types';

import {
  LarvaCourseServiceChangeItemsOfCollectionGqlInput,
  LarvaCourseServiceChangeNameCollectionGqlInput,
  LarvaCourseServiceCreateUserCollectionGqlInput,
} from '../../core/inputs';
import { UserCollectionUseCase } from '../../use-cases/user-collection/user-collection.use-case';

@Resolver()
export class UserCollectionMutation {
  constructor(private useCase: UserCollectionUseCase) {}

  @Mutation(() => Boolean)
  async larvaCourseServiceCreateUserCollection(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: LarvaCourseServiceCreateUserCollectionGqlInput,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    return this.useCase.createCollection({ userId: user.id, input, tenantId });
  }

  @Mutation(() => Boolean)
  async larvaCourseServiceAddItemsToUserCollection(
    @CurrentUser() user: AuthenticatedUser,
    @Args('id') id: string,
    @Args('input') input: LarvaCourseServiceChangeItemsOfCollectionGqlInput,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    return this.useCase.addItemsToCollection({ userId: user.id, id, input, tenantId });
  }

  @Mutation(() => Boolean)
  async larvaCourseServiceRemoveItemsFromUserCollection(
    @CurrentUser() user: AuthenticatedUser,
    @Args('id') id: string,
    @Args('input') input: LarvaCourseServiceChangeItemsOfCollectionGqlInput,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    return this.useCase.removeItemsFromCollection({ userId: user.id, id, input, tenantId });
  }

  @Mutation(() => Boolean)
  async larvaCourseServiceChangeNameUserCollection(
    @CurrentUser() user: AuthenticatedUser,
    @Args('id') id: string,
    @Args('input') input: LarvaCourseServiceChangeNameCollectionGqlInput,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    return this.useCase.changeNameCollection({ userId: user.id, id, name: input.name, tenantId });
  }

  @Mutation(() => Boolean)
  async larvaCourseServiceDeleteUserCollection(
    @CurrentUser() user: AuthenticatedUser,
    @Args('id') id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    return this.useCase.deleteCollection({ userId: user.id, id, tenantId });
  }
}
