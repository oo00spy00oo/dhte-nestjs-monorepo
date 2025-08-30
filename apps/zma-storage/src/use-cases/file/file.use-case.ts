import { Injectable } from '@nestjs/common';
import { Exception } from '@zma-nestjs-monorepo/zma-middlewares';
import { ErrorCode } from '@zma-nestjs-monorepo/zma-types';
import {
  StorageServiceCreateFileMetadataInput,
  StorageServiceUpdateFileMetadataInput,
} from '@zma-nestjs-monorepo/zma-types/inputs/storage';
import { StorageServiceFileMetadataGqlOutput } from '@zma-nestjs-monorepo/zma-types/outputs/storage';

import { IDataServices } from '../../core/abstracts';

import { FileFactoryService } from './file-factory.user-case.service';
@Injectable()
export class FileUseCase {
  constructor(
    private dataServices: IDataServices,
    private factoryService: FileFactoryService,
  ) {}

  async getFileMetadata({
    id,
    tenantId,
  }: {
    id: string;
    tenantId: string;
  }): Promise<StorageServiceFileMetadataGqlOutput> {
    const entity = await this.dataServices.fileService.findOne({
      tenantId,
      find: {
        item: {
          _id: id,
          isDisabled: false,
          isDeleted: false,
        },
      },
    });
    if (!entity) {
      throw new Exception(ErrorCode.FILE_METADATA_NOT_FOUND);
    }
    return this.factoryService.transform(entity);
  }

  async createFileMetadata(
    input: StorageServiceCreateFileMetadataInput,
  ): Promise<StorageServiceFileMetadataGqlOutput> {
    const { id, tenantId, ...createData } = input;
    const entity = await this.dataServices.fileService.create({
      tenantId,
      item: {
        _id: id,
        ...createData,
      },
    });
    if (!entity) {
      throw new Exception(ErrorCode.FILE_METADATA_CREATION_FAILED);
    }
    return this.factoryService.transform(entity);
  }

  async updateFileMetadata(
    input: StorageServiceUpdateFileMetadataInput,
  ): Promise<StorageServiceFileMetadataGqlOutput> {
    const { id, tenantId, ...updateData } = input;
    const existingFile = await this.dataServices.fileService.findById({ id });
    if (!existingFile) {
      throw new Exception(ErrorCode.FILE_METADATA_NOT_FOUND);
    }
    const entity = await this.dataServices.fileService.updateOne({
      tenantId,
      id,
      update: {
        item: updateData,
      },
    });
    if (!entity) {
      throw new Exception(ErrorCode.FILE_METADATA_UPDATE_FAILED);
    }
    return this.factoryService.transform(entity);
  }
}
