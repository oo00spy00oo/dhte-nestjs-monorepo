import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AppConfigModule } from '@zma-nestjs-monorepo/zma-config';
import { ServiceName } from '@zma-nestjs-monorepo/zma-types';

import { DictionaryGrpcConfigService } from '../../services/config/dictionary-grpc-config.service';
import { FnsGrpcConfigService } from '../../services/config/fns-grpc-config.service';
import { CrawlServiceModule } from '../../services/crawl-services/crawl-service.module';
import { DataServicesModule } from '../../services/data-services/data-services.module';
import { LessonOrderUseCaseModule } from '../lesson-order/lesson-order.use-case.module';
import { SentenceFactoryService } from '../sentence/sentence-factory.use-case.service';

import {
  LessonSpeakingFactoryService,
  LessonFactoryService,
} from './lesson-factory.use-case.service';
import { LessonUseCase } from './lesson.use-case';

@Module({
  imports: [
    DataServicesModule,
    LessonOrderUseCaseModule,
    ClientsModule.registerAsync([
      {
        name: ServiceName.DICTIONARY,
        imports: [AppConfigModule],
        useClass: DictionaryGrpcConfigService,
      },
      {
        name: ServiceName.FNS,
        imports: [AppConfigModule],
        useClass: FnsGrpcConfigService,
      },
    ]),
    CrawlServiceModule,
  ],
  providers: [
    LessonFactoryService,
    LessonSpeakingFactoryService,
    LessonUseCase,
    SentenceFactoryService,
  ],
  exports: [
    LessonFactoryService,
    LessonSpeakingFactoryService,
    LessonUseCase,
    SentenceFactoryService,
  ],
})
export class LessonUseCaseModule {}
