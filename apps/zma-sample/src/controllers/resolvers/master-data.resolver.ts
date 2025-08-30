import { Query, Resolver } from '@nestjs/graphql';

import { MasterDataUseCase } from '../../use-cases/master-data/master-data.use-case';

@Resolver()
export class MasterDataResolver {
  constructor(private useCase: MasterDataUseCase) {}

  @Query(() => String)
  async privacyPolicy(): Promise<string> {
    return this.useCase.getPrivacyPolicy();
  }

  @Query(() => String)
  async termAndCondition(): Promise<string> {
    return this.useCase.getTermAndCondition();
  }
}
