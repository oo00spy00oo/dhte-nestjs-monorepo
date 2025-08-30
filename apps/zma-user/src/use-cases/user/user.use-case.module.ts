import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AppConfigModule } from '@zma-nestjs-monorepo/zma-config';
import { KafkaToken, ServiceName } from '@zma-nestjs-monorepo/zma-types';

import { OrganizationGrpcConfigService } from '../../services/config/organization-config.service';
import { UserKafkaConfigService } from '../../services/config/user-kafka-config.service';
import { DataServicesModule } from '../../services/data-services/data-services.module';

import { UserFactoryService } from './user-factory.service';
import { UserUseCase } from './user.use-case';

@Module({
  imports: [
    DataServicesModule,
    ClientsModule.registerAsync([
      {
        name: KafkaToken.UserService,
        imports: [AppConfigModule],
        useClass: UserKafkaConfigService,
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: ServiceName.ORGANIZATION,
        imports: [AppConfigModule],
        useClass: OrganizationGrpcConfigService,
      },
    ]),
  ],
  providers: [UserFactoryService, UserUseCase],
  exports: [UserFactoryService, UserUseCase],
})
export class UserUseCaseModule {}
