import { Module } from '@nestjs/common';

import { CrawlServiceModule } from '../../services/crawl-services/crawl-service.module';
import { DataServicesModule } from '../../services/data-services/data-services.module';

import { SentenceFactoryService } from './sentence-factory.use-case.service';
import { SentenceUseCase } from './sentence.use-case';
@Module({
  imports: [DataServicesModule, CrawlServiceModule],
  providers: [SentenceFactoryService, SentenceUseCase],
  exports: [SentenceFactoryService, SentenceUseCase],
})
export class SentenceUseCaseModule {}
