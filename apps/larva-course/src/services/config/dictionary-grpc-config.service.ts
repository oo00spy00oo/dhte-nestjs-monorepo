import { join } from 'node:path';

import { Injectable, Logger } from '@nestjs/common';
import { ClientProvider, ClientsModuleOptionsFactory, Transport } from '@nestjs/microservices';
import { AppConfigService } from '@zma-nestjs-monorepo/zma-config';
import { ServiceName } from '@zma-nestjs-monorepo/zma-types';

@Injectable()
export class DictionaryGrpcConfigService implements ClientsModuleOptionsFactory {
  constructor(private readonly appConfigService: AppConfigService) {}

  createClientOptions(): ClientProvider {
    Logger.log(`🚀 Dictionary gRPC Url: ${this.appConfigService.getGrpcDictionaryUrl}`);
    return {
      transport: Transport.GRPC,
      options: {
        package: ServiceName.DICTIONARY,
        protoPath: join(__dirname, 'src/proto/dictionary.proto'),
        url: this.appConfigService.getGrpcDictionaryUrl,
      },
    };
  }
}
