import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { StorageService } from '@zma-nestjs-monorepo/zma-grpc';
import { ServiceName, MicroserviceInput } from '@zma-nestjs-monorepo/zma-types';
import {
  StorageServiceCreateFileMetadataInput,
  StorageServiceUpdateFileMetadataInput,
  StorageServiceGetFileMetadataByIdInput,
} from '@zma-nestjs-monorepo/zma-types/inputs/storage';
import { StorageServiceFileMetadataOutput } from '@zma-nestjs-monorepo/zma-types/outputs/storage';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class StorageClientGrpcService implements OnModuleInit {
  private storageService: StorageService;

  constructor(@Inject(ServiceName.STORAGE) private readonly clientGrpc: ClientGrpc) {}

  onModuleInit() {
    this.storageService = this.clientGrpc.getService<StorageService>(ServiceName.STORAGE);
  }

  private wrap<T>(data: T): MicroserviceInput<T> {
    return new MicroserviceInput<T>({
      data,
      requestId: IdUtils.uuidv7(),
    });
  }

  async createFileMetadata(
    input: StorageServiceCreateFileMetadataInput,
  ): Promise<StorageServiceFileMetadataOutput> {
    return firstValueFrom(this.storageService.storageServiceCreateFileMetadata(this.wrap(input)));
  }

  async updateFileMetadata(
    input: StorageServiceUpdateFileMetadataInput,
  ): Promise<StorageServiceFileMetadataOutput> {
    return firstValueFrom(this.storageService.storageServiceUpdateFileMetadata(this.wrap(input)));
  }

  async getFileMetadataById(
    input: StorageServiceGetFileMetadataByIdInput,
  ): Promise<StorageServiceFileMetadataOutput> {
    return firstValueFrom(this.storageService.storageServiceGetFileMetadataById(this.wrap(input)));
  }
}
