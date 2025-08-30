import { Module } from '@nestjs/common';

import { AnalyzeAiServicesModule } from '../../frameworks/ai-services/analyze/analyze.ai-service.module';
import { R2FileServicesModule } from '../../frameworks/files-services/r2/r2.file-service.module';

import { CrawlLessonService } from './crawl-lesson.service';
import { CrawlService } from './crawl.service';

@Module({
  imports: [R2FileServicesModule, AnalyzeAiServicesModule],
  exports: [CrawlService, CrawlLessonService],
  providers: [CrawlService, CrawlLessonService],
})
export class CrawlServiceModule {}
