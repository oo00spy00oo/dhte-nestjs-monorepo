import { Args, Query, Resolver } from '@nestjs/graphql';
import { Pagination } from '@zma-nestjs-monorepo/zma-types';

import { Company } from '../../core/models';
import { CompanyUseCase } from '../../use-cases/company/company.use-case';

@Resolver(() => Company)
export class CompanyResolver {
  constructor(private useCase: CompanyUseCase) {}

  @Query(() => Company)
  async company(@Args('id') id: string): Promise<Company> {
    return this.useCase.getCompany(id);
  }

  @Query(() => [Company])
  async companies(@Args('ids', { type: () => [String] }) ids: string[]): Promise<Company[]> {
    return this.useCase.getCompanies({ ids });
  }

  @Query(() => [Company])
  async allCompanies(@Args('pagination') pagination: Pagination): Promise<Company[]> {
    return this.useCase.getAllCompanies(pagination);
  }

  @Query(() => [Company])
  async enabledCompanies(@Args('pagination') pagination: Pagination): Promise<Company[]> {
    return this.useCase.getEnabledCompanies(pagination);
  }

  @Query(() => [Company])
  async disabledCompanies(@Args('pagination') pagination: Pagination): Promise<Company[]> {
    return this.useCase.getDisabledCompanies(pagination);
  }

  @Query(() => [Company])
  async searchCompanies(
    @Args('input') input: string,
    @Args('pagination') pagination: Pagination,
  ): Promise<Company[]> {
    return this.useCase.searchCompanies({ input, pagination });
  }
}
