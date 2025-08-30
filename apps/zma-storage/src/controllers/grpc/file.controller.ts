import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import {
  MicroserviceInput,
  ServiceName,
  StorageServiceSubject,
} from '@zma-nestjs-monorepo/zma-types';
import {
  StorageServiceInputMapper,
  StorageServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/storage';

import { FileUseCase } from '../../use-cases/file/file.use-case';

@Controller()
export class FileGrpcController {
  private readonly logger = new Logger(FileGrpcController.name);
  constructor(private readonly fileUseCase: FileUseCase) {}

  @GrpcMethod(ServiceName.STORAGE, StorageServiceSubject.GetFileMetadataById)
  async storageServiceGetFileMetadataById(
    @Payload()
    input: MicroserviceInput<StorageServiceInputMapper<StorageServiceSubject.GetFileMetadataById>>,
  ): Promise<StorageServiceOutputMapper<StorageServiceSubject.GetFileMetadataById>> {
    this.logger.log('getFileMetadataById');
    return this.fileUseCase.getFileMetadata({ id: input.data.id, tenantId: input.data.tenantId });
  }

  @GrpcMethod(ServiceName.STORAGE, StorageServiceSubject.CreateFileMetadata)
  async storageServiceCreateFileMetadata(
    @Payload()
    input: MicroserviceInput<StorageServiceInputMapper<StorageServiceSubject.CreateFileMetadata>>,
  ): Promise<StorageServiceOutputMapper<StorageServiceSubject.CreateFileMetadata>> {
    this.logger.log('createFileMetadata');
    return this.fileUseCase.createFileMetadata(input.data);
  }

  @GrpcMethod(ServiceName.STORAGE, StorageServiceSubject.UpdateFileMetadata)
  async storageServiceUpdateFileMetadata(
    @Payload()
    input: MicroserviceInput<StorageServiceInputMapper<StorageServiceSubject.UpdateFileMetadata>>,
  ): Promise<StorageServiceOutputMapper<StorageServiceSubject.UpdateFileMetadata>> {
    this.logger.log('updateFileMetadata');
    return this.fileUseCase.updateFileMetadata(input.data);
  }
}
