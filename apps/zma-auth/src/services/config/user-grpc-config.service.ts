import { join } from 'node:path';

import { Injectable, Logger } from '@nestjs/common';
import { ClientProvider, ClientsModuleOptionsFactory, Transport } from '@nestjs/microservices';
import { AppConfigService } from '@zma-nestjs-monorepo/zma-config';
import { ServiceName } from '@zma-nestjs-monorepo/zma-types';

@Injectable()
export class UserGrpcConfigService implements ClientsModuleOptionsFactory {
  constructor(private readonly configService: AppConfigService) {}

  createClientOptions(): ClientProvider {
    const grpcUrl = this.configService.getGrpcUserUrl;
    Logger.log(`🚀 gRPC Url: ${grpcUrl}`);
    return {
      transport: Transport.GRPC,
      options: {
        package: ServiceName.USER,
        protoPath: join(__dirname, 'src/proto/user.proto'),
        url: grpcUrl,
      },
    };
  }
}
