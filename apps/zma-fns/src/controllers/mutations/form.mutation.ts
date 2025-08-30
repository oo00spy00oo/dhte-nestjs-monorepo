import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentTenant } from '@zma-nestjs-monorepo/zma-decorators';

import { FnsServiceCreateFormGqlInput, FnsServiceUpdateFormGqlInput } from '../../core/inputs';
import { FnsServiceFormGqlOutput } from '../../core/outputs';
import { FormUseCase } from '../../use-cases/form/form.use-case';

@Resolver()
export class FormMutation {
  constructor(private formUseCase: FormUseCase) {}

  // Admin only
  @Mutation(() => FnsServiceFormGqlOutput)
  async fnsServiceCreateFormForAdmin(
    @CurrentTenant() tenantId: string,
    @Args('input') input: FnsServiceCreateFormGqlInput,
  ): Promise<FnsServiceFormGqlOutput> {
    return this.formUseCase.createFormForAdmin({ tenantId, input });
  }

  // Admin only
  @Mutation(() => FnsServiceFormGqlOutput)
  async fnsServiceUpdateFormForAdmin(
    @CurrentTenant() tenantId: string,
    @Args('id') id: string,
    @Args('input') input: FnsServiceUpdateFormGqlInput,
  ): Promise<FnsServiceFormGqlOutput> {
    return this.formUseCase.updateFormForAdmin({ tenantId, id, input });
  }
}
