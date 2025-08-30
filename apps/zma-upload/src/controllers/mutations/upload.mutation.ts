import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentTenant } from '@zma-nestjs-monorepo/zma-decorators';

import { UploadServiceCompleteGqlInput, UploadServiceRequestGqlInput } from '../../core/inputs';
import {
  UploadServiceCompleteGqlOutput,
  UploadServiceRequestGqlOutput,
} from '../../core/outputs/upload.output';
import { UploadUseCase } from '../../use-cases/upload/upload.use-case';

@Resolver()
export class UploadMutation {
  constructor(private readonly uploadUseCase: UploadUseCase) {}

  @Mutation(() => UploadServiceRequestGqlOutput)
  async uploadServiceRequestUpload(
    @Args('input') input: UploadServiceRequestGqlInput,
    @CurrentTenant() tenantId: string,
  ): Promise<UploadServiceRequestGqlOutput> {
    return this.uploadUseCase.requestUpload({ tenantId, input });
  }

  @Mutation(() => UploadServiceCompleteGqlOutput)
  async uploadServiceCompleteUpload(
    @Args('input') input: UploadServiceCompleteGqlInput,
    @CurrentTenant() tenantId: string,
  ): Promise<UploadServiceCompleteGqlOutput> {
    return this.uploadUseCase.completeUpload({ tenantId, input });
  }
}
