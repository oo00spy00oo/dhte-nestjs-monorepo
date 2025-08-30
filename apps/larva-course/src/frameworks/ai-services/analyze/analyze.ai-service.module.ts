import { Module } from '@nestjs/common';

import { AnalyzeAiService } from './analyze.ai-service.service';

@Module({
  providers: [AnalyzeAiService],
  exports: [AnalyzeAiService],
})
export class AnalyzeAiServicesModule {}
