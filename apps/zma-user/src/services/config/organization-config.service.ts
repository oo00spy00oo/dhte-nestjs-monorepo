import { join } from 'node:path';

import { Injectable, Logger } from '@nestjs/common';
import { ClientProvider, ClientsModuleOptionsFactory, Transport } from '@nestjs/microservices';
import { AppConfigService } from '@zma-nestjs-monorepo/zma-config';
import { ServiceName } from '@zma-nestjs-monorepo/zma-types';

@Injectable()
export class OrganizationGrpcConfigService implements ClientsModuleOptionsFactory {
  constructor(private readonly appConfigService: AppConfigService) {}

  createClientOptions(): ClientProvider {
    Logger.log(`🚀 gRPC Url: ${this.appConfigService.getGrpcOrganizationUrl}`);
    return {
      transport: Transport.GRPC,
      options: {
        package: ServiceName.ORGANIZATION,
        protoPath: join(__dirname, 'src/proto/organization.proto'),
        url: this.appConfigService.getGrpcOrganizationUrl,
      },
    };
  }
}
