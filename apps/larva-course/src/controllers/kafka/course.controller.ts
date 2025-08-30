import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KafkaTopic } from '@zma-nestjs-monorepo/zma-types';

import { LarvaCourseServiceCrawlSentenceKafkaInput } from '../../core/inputs';
import { SentenceUseCase } from '../../use-cases/sentence/sentence.use-case';

@Controller()
export class LarvaCourseKafkaController {
  private readonly logger = new Logger(LarvaCourseKafkaController.name);
  constructor(private readonly sentenceUseCase: SentenceUseCase) {}

  @EventPattern(KafkaTopic.LarvaCourseCrawlSentenceTopic)
  async handleCrawlSentenceEvent(@Payload() data: LarvaCourseServiceCrawlSentenceKafkaInput) {
    this.logger.log(`Received crawl sentence event: ${JSON.stringify(data)}`);
    await this.sentenceUseCase.handleCrawlSentenceEvent(data);
  }
}
