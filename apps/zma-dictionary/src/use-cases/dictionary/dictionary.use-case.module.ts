import { Module } from '@nestjs/common';

import { R2FileServicesModule } from '../../frameworks/files-services/r2/r2.file-service.module';
import { CrawlServiceModule } from '../../services/crawl-service/crawl-service.module';
import { DataServicesModule } from '../../services/data-services/data-services.module';
import { TranslationServiceModule } from '../../services/translation-service/translation-service.module';

import { DictionaryFactoryService } from './dictionary-factory.use-case.service';
import { DictionaryUseCase } from './dictionary.use-case';

@Module({
  imports: [DataServicesModule, CrawlServiceModule, R2FileServicesModule, TranslationServiceModule],
  providers: [DictionaryFactoryService, DictionaryUseCase],
  exports: [DictionaryFactoryService, DictionaryUseCase],
})
export class DictionaryUseCaseModule {}
