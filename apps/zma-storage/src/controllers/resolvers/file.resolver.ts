import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentTenant } from '@zma-nestjs-monorepo/zma-decorators';
import { StorageServiceFileMetadataGqlOutput } from '@zma-nestjs-monorepo/zma-types/outputs/storage';

import { FileModel } from '../../core/models';
import { FileUseCase } from '../../use-cases/file/file.use-case';

@Resolver(() => FileModel)
export class FileResolver {
  constructor(private useCase: FileUseCase) {}

  @Query(() => StorageServiceFileMetadataGqlOutput)
  async storageServiceGetFileMetadata(
    @Args('id') id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<StorageServiceFileMetadataGqlOutput> {
    return this.useCase.getFileMetadata({ id, tenantId });
  }
}
