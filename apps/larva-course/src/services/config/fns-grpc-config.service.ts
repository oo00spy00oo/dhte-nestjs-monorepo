import { join } from 'node:path';

import { Injectable, Logger } from '@nestjs/common';
import { ClientProvider, ClientsModuleOptionsFactory, Transport } from '@nestjs/microservices';
import { AppConfigService } from '@zma-nestjs-monorepo/zma-config';
import { ServiceName } from '@zma-nestjs-monorepo/zma-types';

@Injectable()
export class FnsGrpcConfigService implements ClientsModuleOptionsFactory {
  constructor(private readonly appConfigService: AppConfigService) {}

  createClientOptions(): ClientProvider {
    Logger.log(`🚀 Fns gRPC Url: ${this.appConfigService.getGrpcFnsUrl}`);
    return {
      transport: Transport.GRPC,
      options: {
        package: ServiceName.FNS,
        protoPath: join(__dirname, 'src/proto/fns.proto'),
        url: this.appConfigService.getGrpcFnsUrl,
      },
    };
  }
}
