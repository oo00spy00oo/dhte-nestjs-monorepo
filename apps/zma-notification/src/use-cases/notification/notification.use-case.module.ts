import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AppConfigModule } from '@zma-nestjs-monorepo/zma-config';
import { ServiceName } from '@zma-nestjs-monorepo/zma-types';

import { UserGrpcConfigService } from '../../services/config/user-grpc-config.service';
import { DataServicesModule } from '../../services/data-services/data-services.module';
import {
  EmailChannelUseCaseModule,
  InAppChannelUseCaseModule,
  PushChannelUseCaseModule,
} from '../notification-channels';

import { NotificationFactoryService } from './notification-factory.use-case.service';
import { NotificationUseCase } from './notification.use-case';

@Module({
  imports: [
    DataServicesModule,
    EmailChannelUseCaseModule,
    InAppChannelUseCaseModule,
    PushChannelUseCaseModule,
    ClientsModule.registerAsync([
      {
        name: ServiceName.USER,
        imports: [AppConfigModule],
        useClass: UserGrpcConfigService,
      },
    ]),
  ],
  providers: [NotificationUseCase, NotificationFactoryService],
  exports: [NotificationUseCase],
})
export class NotificationUseCaseModule {}
