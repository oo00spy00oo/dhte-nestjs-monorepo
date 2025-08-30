import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AppConfigModule } from '@zma-nestjs-monorepo/zma-config';
import { KafkaToken } from '@zma-nestjs-monorepo/zma-types';

import { AnalyzeAiServicesModule } from '../../frameworks/ai-services/analyze/analyze.ai-service.module';
import { R2FileServicesModule } from '../../frameworks/files-services/r2/r2.file-service.module';
import { KafkaConfigService } from '../config';

import { CrawlSentenceService } from './crawl-sentence.service';
import { CrawlWordService } from './crawl-word.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: KafkaToken.LarvaCourseService,
        imports: [AppConfigModule],
        useClass: KafkaConfigService,
      },
    ]),
    AnalyzeAiServicesModule,
    R2FileServicesModule,
  ],
  providers: [CrawlWordService, CrawlSentenceService],
  exports: [CrawlWordService, CrawlSentenceService],
})
export class CrawlServiceModule {}
