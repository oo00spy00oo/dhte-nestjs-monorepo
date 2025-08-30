import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AppConfigModule } from '@zma-nestjs-monorepo/zma-config';
import { ServiceName } from '@zma-nestjs-monorepo/zma-types';

import { UserGrpcConfigService } from '../../services/configs';
import { DataServicesModule } from '../../services/data-services/data-services.module';

import { UserResponseFactoryUseCase } from './user-response-factory.use-case';
import { UserResponseUseCase } from './user-response.use-case';

@Module({
  imports: [
    DataServicesModule,
    ClientsModule.registerAsync([
      {
        name: ServiceName.USER,
        imports: [AppConfigModule],
        useClass: UserGrpcConfigService,
      },
    ]),
  ],
  providers: [UserResponseUseCase, UserResponseFactoryUseCase],
  exports: [UserResponseUseCase, UserResponseFactoryUseCase],
})
export class UserResponseUseCaseModule {}
