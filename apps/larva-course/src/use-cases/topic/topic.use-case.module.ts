import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AppConfigModule } from '@zma-nestjs-monorepo/zma-config';
import { ServiceName } from '@zma-nestjs-monorepo/zma-types';

import { DictionaryGrpcConfigService } from '../../services/config/dictionary-grpc-config.service';
import { DataServicesModule } from '../../services/data-services/data-services.module';
import { TopicOrderUseCase } from '../topic-order/topic-order.use-case';
import { TopicOrderUseCaseModule } from '../topic-order/topic-order.use-case.module';

import { TopicFactoryService } from './topic-factory.use-case.service';
import { TopicUseCase } from './topic.use-case';

@Module({
  imports: [
    DataServicesModule,
    TopicOrderUseCaseModule,
    ClientsModule.registerAsync([
      {
        name: ServiceName.DICTIONARY,
        imports: [AppConfigModule],
        useClass: DictionaryGrpcConfigService,
      },
    ]),
  ],
  providers: [TopicFactoryService, TopicUseCase],
  exports: [TopicFactoryService, TopicUseCase],
})
export class TopicUseCaseModule {}
