import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentTenant, CurrentUser } from '@zma-nestjs-monorepo/zma-decorators';
import { AuthenticatedUser, Pagination } from '@zma-nestjs-monorepo/zma-types';

import { LarvaCourseServiceSearchCollectionOfUserGqlInput } from '../../core/inputs';
import {
  LarvaCourseServiceDetailUserCollectionGqlOutput,
  LarvaCourseServiceGeneralUserCollectionGqlOutput,
} from '../../core/outputs';
import { UserCollectionUseCase } from '../../use-cases/user-collection/user-collection.use-case';

@Resolver()
export class UserCollectionResolver {
  constructor(private useCase: UserCollectionUseCase) {}

  @Query(() => LarvaCourseServiceDetailUserCollectionGqlOutput)
  async larvaCourseServiceCollection(
    @Args('id') id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<LarvaCourseServiceDetailUserCollectionGqlOutput> {
    return this.useCase.getCollectionById({ id, tenantId });
  }

  @Query(() => [LarvaCourseServiceGeneralUserCollectionGqlOutput])
  async larvaCourseServiceCollections(
    @Args('ids', { type: () => [String] }) ids: string[],
    @Args('pagination') pagination: Pagination,
    @CurrentTenant() tenantId: string,
  ): Promise<LarvaCourseServiceGeneralUserCollectionGqlOutput[]> {
    return this.useCase.getCollectionsByIds({ ids, pagination, tenantId });
  }

  @Query(() => [LarvaCourseServiceGeneralUserCollectionGqlOutput])
  async larvaCourseServiceCollectionsOfUser(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('pagination') pagination: Pagination,
    @CurrentTenant() tenantId: string,
  ): Promise<LarvaCourseServiceGeneralUserCollectionGqlOutput[]> {
    return this.useCase.getCollectionsOfUser({ userId: currentUser.id, pagination, tenantId });
  }

  @Query(() => [LarvaCourseServiceGeneralUserCollectionGqlOutput])
  async larvaCourseServiceSearchCollectionsOfUser(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input') input: LarvaCourseServiceSearchCollectionOfUserGqlInput,
    @Args('pagination') pagination: Pagination,
    @CurrentTenant() tenantId: string,
  ): Promise<LarvaCourseServiceGeneralUserCollectionGqlOutput[]> {
    return this.useCase.searchCollectionsOfUser({
      userId: currentUser.id,
      input,
      pagination,
      tenantId,
    });
  }
}
