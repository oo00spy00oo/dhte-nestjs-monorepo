import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { CompanyInput } from '../../core/inputs';
import { CompanyUseCase } from '../../use-cases/company/company.use-case';

@Resolver()
export class CompanyMutation {
  constructor(private useCase: CompanyUseCase) {}

  @Mutation(() => Boolean)
  async createCompany(
    @Args('input', { type: () => CompanyInput }) input: CompanyInput,
  ): Promise<boolean> {
    return this.useCase.createCompany(input);
  }

  @Mutation(() => Boolean)
  async updateCompany(
    @Args('input', { type: () => CompanyInput }) input: CompanyInput,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.useCase.updateCompany({ input, id });
  }

  @Mutation(() => Boolean)
  async deleteCompanies(@Args('ids', { type: () => [String] }) ids: string[]): Promise<boolean> {
    return this.useCase.deleteCompanies(ids);
  }

  @Mutation(() => Boolean)
  async enableCompanies(@Args('ids', { type: () => [String] }) ids: string[]): Promise<boolean> {
    return this.useCase.enableCompanies(ids);
  }
}
