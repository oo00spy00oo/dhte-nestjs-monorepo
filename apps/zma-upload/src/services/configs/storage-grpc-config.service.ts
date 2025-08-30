import { join } from 'node:path';

import { Injectable, Logger } from '@nestjs/common';
import { ClientProvider, ClientsModuleOptionsFactory, Transport } from '@nestjs/microservices';
import { AppConfigService } from '@zma-nestjs-monorepo/zma-config';
import { ServiceName } from '@zma-nestjs-monorepo/zma-types';

@Injectable()
export class StorageGrpcConfigService implements ClientsModuleOptionsFactory {
  constructor(private readonly appConfigService: AppConfigService) {}

  createClientOptions(): ClientProvider {
    const grpcUrl = this.appConfigService.getGrpcStorageUrl;
    Logger.log(`🚀 Storage gRPC Url: ${grpcUrl}`);
    return {
      transport: Transport.GRPC,
      options: {
        package: ServiceName.STORAGE,
        protoPath: join(__dirname, 'src/proto/storage.proto'),
        url: grpcUrl,
      },
    };
  }
}
