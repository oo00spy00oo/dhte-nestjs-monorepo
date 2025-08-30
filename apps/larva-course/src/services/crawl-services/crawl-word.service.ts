import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaToken, KafkaTopic } from '@zma-nestjs-monorepo/zma-types';
import { DictionaryServiceCrawlWordsForLessonKafkaInput } from '@zma-nestjs-monorepo/zma-types/inputs/dictionary';
import { DictionaryServiceDictionaryOutput } from '@zma-nestjs-monorepo/zma-types/outputs/dictionary';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';

@Injectable()
export class CrawlWordService {
  private readonly logger = new Logger(CrawlWordService.name);
  constructor(@Inject(KafkaToken.LarvaCourseService) private kafkaClient: ClientKafka) {}

  private emitKafkaCrawlEvent(data: DictionaryServiceCrawlWordsForLessonKafkaInput): void {
    const topic = KafkaTopic.DictionaryCrawlWordTopic;
    this.kafkaClient.emit(topic, data);
  }

  crawlWords(words: DictionaryServiceDictionaryOutput[]): void {
    const message: DictionaryServiceCrawlWordsForLessonKafkaInput = {
      requestId: IdUtils.uuidv7(),
      words: words.map((word) => ({
        word: word.word,
        partOfSpeech: word.partOfSpeech,
      })),
      timestamp: new Date().toISOString(),
    };
    this.emitKafkaCrawlEvent(message);
    this.logger.log(`Emitted crawl Kafka event for words: ${JSON.stringify(message.words)}`);
  }
}
