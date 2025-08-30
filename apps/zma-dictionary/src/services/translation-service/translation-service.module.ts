import { Module } from '@nestjs/common';

import { TranslationService } from './translation.service';

@Module({
  imports: [],
  providers: [TranslationService],
  exports: [TranslationService],
})
export class TranslationServiceModule {}
