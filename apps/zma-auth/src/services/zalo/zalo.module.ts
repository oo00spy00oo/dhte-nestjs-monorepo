import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AppConfigModule } from '@zma-nestjs-monorepo/zma-config';
import { ServiceName } from '@zma-nestjs-monorepo/zma-types';

import { UserGrpcConfigService } from '../config/user-grpc-config.service';

import { ZaloService } from './zalo.service';

@Module({
  imports: [
    HttpModule,
    ClientsModule.registerAsync([
      {
        name: ServiceName.USER,
        imports: [AppConfigModule],
        useClass: UserGrpcConfigService,
      },
    ]),
  ],
  exports: [ZaloService],
  providers: [ZaloService],
})
export class ZaloModule {}
