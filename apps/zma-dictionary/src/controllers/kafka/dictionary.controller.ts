import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KafkaTopic } from '@zma-nestjs-monorepo/zma-types';
import { DictionaryServiceCrawlWordsForLessonKafkaInput } from '@zma-nestjs-monorepo/zma-types/inputs/dictionary';

import { DictionaryUseCase } from '../../use-cases/dictionary/dictionary.use-case';

@Controller()
export class DictionaryKafkaController {
  private readonly logger = new Logger(DictionaryKafkaController.name);
  constructor(private readonly dictionaryUseCase: DictionaryUseCase) {}

  @EventPattern(KafkaTopic.DictionaryCrawlWordTopic)
  async handleCrawlWordEvent(@Payload() data: DictionaryServiceCrawlWordsForLessonKafkaInput) {
    this.logger.log(`Received crawl word event: ${JSON.stringify(data)}`);
    await this.dictionaryUseCase.crawlWordsForLesson(data);
  }
}
