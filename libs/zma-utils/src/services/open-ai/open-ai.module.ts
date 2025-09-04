import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { OpenAiService } from './open-ai.service';

@Module({
  imports: [ConfigModule],
  providers: [OpenAiService],
  exports: [OpenAiService],
})
export class ZmaOpenAiModule {}