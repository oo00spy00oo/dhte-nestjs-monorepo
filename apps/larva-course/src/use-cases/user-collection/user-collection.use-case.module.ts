import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AppConfigModule } from '@zma-nestjs-monorepo/zma-config';
import { ServiceName } from '@zma-nestjs-monorepo/zma-types';

import { DictionaryGrpcConfigService } from '../../services/config/dictionary-grpc-config.service';
import { DataServicesModule } from '../../services/data-services/data-services.module';
import { SentenceUseCaseModule } from '../sentence/sentence.use-case.module';

import { UserCollectionFactoryService } from './user-collection-factory.use-case.service';
import { UserCollectionUseCase } from './user-collection.use-case';

@Module({
  imports: [
    DataServicesModule,
    ClientsModule.registerAsync([
      {
        name: ServiceName.DICTIONARY,
        imports: [AppConfigModule],
        useClass: DictionaryGrpcConfigService,
      },
    ]),
    SentenceUseCaseModule,
  ],
  providers: [UserCollectionFactoryService, UserCollectionUseCase],
  exports: [UserCollectionFactoryService, UserCollectionUseCase],
})
export class UserCollectionUseCaseModule {}
