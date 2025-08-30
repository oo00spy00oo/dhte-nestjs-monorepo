import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { appConfiguration } from '../../../configuration';

import { AnalyzeAiService } from './analyze.ai-service.service';

@Module({
  providers: [
    AnalyzeAiService,
    {
      provide: 'APP_CONFIG',
      useFactory: (configService: ConfigService) => appConfiguration(configService),
      inject: [ConfigService],
    },
  ],
  exports: [AnalyzeAiService],
})
export class AnalyzeAiServicesModule {}
