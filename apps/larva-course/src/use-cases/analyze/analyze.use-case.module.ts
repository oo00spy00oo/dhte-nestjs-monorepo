import { Module } from '@nestjs/common';

import { AnalyzeAiServicesModule } from '../../frameworks/ai-services/analyze/analyze.ai-service.module';
import { DataServicesModule } from '../../services/data-services/data-services.module';
import { LessonSpeakingFactoryService } from '../lesson/lesson-factory.use-case.service';
import { SentenceFactoryService } from '../sentence/sentence-factory.use-case.service';

import { AnalyzeFactoryService } from './analyze-factory.use-case.service';
import { AnalyzeUseCase } from './analyze.use-case';
@Module({
  imports: [DataServicesModule, AnalyzeAiServicesModule],
  providers: [
    AnalyzeFactoryService,
    AnalyzeUseCase,
    LessonSpeakingFactoryService,
    SentenceFactoryService,
  ],
  exports: [
    AnalyzeFactoryService,
    AnalyzeUseCase,
    LessonSpeakingFactoryService,
    SentenceFactoryService,
  ],
})
export class AnalyzeUseCaseModule {}
