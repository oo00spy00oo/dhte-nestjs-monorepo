import { Injectable, Logger } from '@nestjs/common';
import { Exception } from '@zma-nestjs-monorepo/zma-middlewares';
import { Pagination } from '@zma-nestjs-monorepo/zma-types';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import mongoose from 'mongoose';

import { IDataServices } from '../../core/abstracts';
import {
  LarvaCourseServiceCrawlSentenceKafkaInput,
  LarvaCourseServiceCreateSentenceGqlInput,
  LarvaCourseServiceSearchSentenceGqlInput,
  LarvaCourseServiceSentenceTranslationGqlInput,
  LarvaCourseServiceUpdateSentenceGqlInput,
} from '../../core/inputs';
import {
  LarvaCourseServiceSentenceGqlOutput,
  LarvaCourseServiceSentencesGqlOutput,
  LarvaCourseServiceSentenceTranslationGqlOutput,
} from '../../core/outputs';
import { LarvaCourseServiceCourseStatus } from '../../core/types';
import { CrawlSentenceService } from '../../services/crawl-services/crawl-sentence.service';

import { SentenceFactoryService } from './sentence-factory.use-case.service';

@Injectable()
export class SentenceUseCase {
  private readonly logger = new Logger(SentenceUseCase.name);
  constructor(
    private dataServices: IDataServices,
    private factoryService: SentenceFactoryService,
    private crawlSentenceService: CrawlSentenceService,
  ) {}

  async getSentence({
    id,
    tenantId,
  }: {
    id: string;
    tenantId: string;
  }): Promise<LarvaCourseServiceSentenceGqlOutput> {
    const entity = await this.dataServices.sentenceService.findById({ id, tenantId });
    const translations = await this.dataServices.sentenceTranslationService.findMany({
      tenantId,
      find: {
        filter: { sentenceId: id },
      },
    });
    if (!entity) {
      throw new Exception('Sentence not found');
    }

    return this.factoryService.transform({
      entity,
      translations: translations as LarvaCourseServiceSentenceTranslationGqlOutput[],
    });
  }

  async getSentences({
    ids,
    pagination,
    tenantId,
  }: {
    ids: string[];
    pagination: Pagination;
    tenantId: string;
  }): Promise<LarvaCourseServiceSentenceGqlOutput[]> {
    const { skip, limit } = pagination;
    const sentenceIds = ids.map((id) => new mongoose.Types.UUID(id));
    const pipeline = [
      {
        $match: {
          _id: { $in: sentenceIds },
          tenantId: new mongoose.Types.UUID(tenantId),
          status: LarvaCourseServiceCourseStatus.Active,
        },
      },
      {
        $lookup: {
          from: 'sentence_translations',
          localField: '_id',
          foreignField: 'sentenceId',
          as: 'translations',
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];
    const entities = await this.dataServices.sentenceService.aggregate({
      pipeline,
    });
    return entities.map((entity) =>
      this.factoryService.transform({
        entity,
        translations: entity.translations as LarvaCourseServiceSentenceTranslationGqlOutput[],
      }),
    );
  }

  async getAllSentences({
    pagination,
    tenantId,
  }: {
    pagination: Pagination;
    tenantId: string;
  }): Promise<LarvaCourseServiceSentenceGqlOutput[]> {
    const { skip, limit } = pagination;
    const pipeline: any[] = [
      {
        $match: {
          tenantId: new mongoose.Types.UUID(tenantId),
          status: LarvaCourseServiceCourseStatus.Active,
        },
      },
      {
        $lookup: {
          from: 'sentence_translations',
          localField: '_id',
          foreignField: 'sentenceId',
          as: 'translations',
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];
    const entities = await this.dataServices.sentenceService.aggregate({
      pipeline,
    });
    return entities.map((entity) =>
      this.factoryService.transform({
        entity,
        translations: entity.translations as LarvaCourseServiceSentenceTranslationGqlOutput[],
      }),
    );
  }

  async searchSentences({
    input,
    pagination,
    tenantId,
  }: {
    input: LarvaCourseServiceSearchSentenceGqlInput;
    pagination: Pagination;
    tenantId: string;
  }): Promise<LarvaCourseServiceSentencesGqlOutput> {
    const { limit, skip } = pagination;
    let filter: any = {
      tenantId: new mongoose.Types.UUID(tenantId),
      status: LarvaCourseServiceCourseStatus.Active,
    };
    filter = Object.keys(input).reduce((acc, key) => {
      if (input[key]) {
        if (key === 'content') {
          acc.content = { $regex: input[key], $options: 'i' };
        } else {
          acc[key] = input[key];
        }
      }
      return acc;
    }, filter);

    const pipeline: any[] = [
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'sentence_translations',
          localField: '_id',
          foreignField: 'sentenceId',
          as: 'translations',
        },
      },
      {
        $facet: {
          data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }],
          total: [{ $count: 'count' }],
        },
      },
    ];
    const entities = await this.dataServices.sentenceService.aggregate({
      pipeline,
    });

    const sentences = (entities[0]?.data ?? []).map((entity) =>
      this.factoryService.transform({
        entity,
        translations: entity.translations as LarvaCourseServiceSentenceTranslationGqlOutput[],
      }),
    );
    return this.factoryService.transformMany({
      entities: sentences,
      total: entities[0]?.total?.[0]?.count ?? 0,
    });
  }

  async createSentence({
    input,
    tenantId,
  }: {
    input: LarvaCourseServiceCreateSentenceGqlInput;
    tenantId: string;
  }): Promise<boolean> {
    const wordsOfContent = input.content.split(' ');
    const wordsOfPronunciationText = input.pronunciationText.split(' ');
    if (wordsOfContent.length !== wordsOfPronunciationText.length) {
      throw new Exception('Words of content and pronunciation text must be the same');
    }
    const newSentence = {
      ...input,
      words: wordsOfContent.map((word, index) => ({
        position: index + 1,
        word: word.trim(),
        pronunciation: wordsOfPronunciationText[index].trim(),
      })),
      status: LarvaCourseServiceCourseStatus.Active,
      tenantId,
    };

    const sentence = await this.dataServices.sentenceService.create({
      item: newSentence,
      tenantId,
    });

    // Add crawl sentence event to Kafka
    this.crawlSentenceService.emitKafkaCrawlEvent({
      requestId: IdUtils.uuidv7(),
      sentenceId: sentence._id,
      tenantId,
      timestamp: new Date().toISOString(),
    });

    await this.dataServices.sentenceTranslationService.createMany({
      items: input.translations.map((translation) => ({
        sentenceId: sentence._id,
        language: translation.language,
        translation: translation.translation,
        tenantId,
        status: LarvaCourseServiceCourseStatus.Active,
      })),
      tenantId,
    });

    return !!sentence;
  }

  private async updateSentenceTranslations({
    sentenceId,
    translations,
    tenantId,
  }: {
    sentenceId: string;
    translations: LarvaCourseServiceSentenceTranslationGqlInput[];
    tenantId: string;
  }) {
    const existingTranslations = await this.dataServices.sentenceTranslationService.findMany({
      tenantId,
      find: { filter: { sentenceId } },
    });

    const existingMap = new Map(existingTranslations.map((t) => [t.language, t]));

    const updatePromises = [];
    const itemsToCreate = [];

    for (const t of translations) {
      const existingTranslation = existingMap.get(t.language);
      if (existingTranslation) {
        updatePromises.push(
          this.dataServices.sentenceTranslationService.updateOne({
            id: existingTranslation._id,
            update: { item: { translation: t.translation } },
            tenantId,
          }),
        );
      } else {
        itemsToCreate.push({
          sentenceId,
          language: t.language,
          translation: t.translation,
          tenantId,
          status: LarvaCourseServiceCourseStatus.Active,
        });
      }
    }

    const allPromises = [...updatePromises];
    if (itemsToCreate.length > 0) {
      allPromises.push(
        this.dataServices.sentenceTranslationService.createMany({
          items: itemsToCreate,
          tenantId,
        }),
      );
    }

    await Promise.all(allPromises);
  }

  private isContentChanged({
    oldContent,
    newContent,
  }: {
    oldContent: string;
    newContent: string | null;
  }): boolean {
    return newContent && oldContent.trim().toLowerCase() !== newContent.trim().toLowerCase();
  }

  private buildWordList({
    words,
    pronunciations,
    audioMap,
  }: {
    words: string[];
    pronunciations: string[];
    audioMap: Map<string, string | null> | null;
  }) {
    return words.map((word, index) => ({
      position: index + 1,
      word: word.trim(),
      pronunciation: pronunciations[index].trim(),
      audioUrl: audioMap ? audioMap.get(word.trim().toLowerCase()) || null : null,
    }));
  }

  async updateSentence({
    id,
    input,
    tenantId,
  }: {
    id: string;
    input: LarvaCourseServiceUpdateSentenceGqlInput;
    tenantId: string;
  }): Promise<boolean> {
    const wordsOfContent = input.content?.split(' ') || [];
    const wordsOfPronunciationText = input.pronunciationText?.split(' ') || [];
    if (wordsOfContent.length !== wordsOfPronunciationText.length) {
      throw new Exception('Words of content and pronunciation text must be the same');
    }

    const sentence = await this.dataServices.sentenceService.findById({ id, tenantId });
    if (!sentence) {
      throw new Exception('Sentence not found');
    }

    const contentChanged = this.isContentChanged({
      oldContent: sentence.content,
      newContent: input.content,
    });

    const audioMap = contentChanged
      ? null
      : new Map(sentence.words.map((w) => [w.word.trim().toLowerCase(), w.audioUrl || null]));

    const updateSentence = {
      ...input,
      videos: contentChanged ? [] : sentence.videos,
      ...(input.content
        ? {
            words: this.buildWordList({
              words: wordsOfContent,
              pronunciations: wordsOfPronunciationText,
              audioMap,
            }),
          }
        : {}),
    };

    if (contentChanged) {
      this.logger.log(`Content changed for sentence ${id}, starting clean up assets if needed`);
      await this.crawlSentenceService.cleanSentenceAssets(sentence);
    }

    //check if input has many translations, check sentenceTranslation in database, if has sentenceTranslation, update sentenceTranslation, if not, create sentenceTranslation
    if (input.translations && input.translations.length > 0) {
      await this.updateSentenceTranslations({
        sentenceId: id,
        translations: input.translations,
        tenantId,
      });
    }

    const entity = await this.dataServices.sentenceService.updateOne({
      id,
      update: { item: updateSentence },
      tenantId,
    });

    // Add crawl sentence event to Kafka
    this.crawlSentenceService.emitKafkaCrawlEvent({
      requestId: IdUtils.uuidv7(),
      sentenceId: sentence._id,
      tenantId,
      timestamp: new Date().toISOString(),
    });

    return !!entity;
  }

  async publishSentences({ ids, tenantId }: { ids: string[]; tenantId: string }): Promise<boolean> {
    const entity = await this.dataServices.sentenceService.updateMany({
      tenantId,
      filter: { _id: { $in: ids }, status: LarvaCourseServiceCourseStatus.Draft },
      update: {
        item: { status: LarvaCourseServiceCourseStatus.Active },
      },
    });
    return !!entity;
  }

  async handleCrawlSentenceEvent(data: LarvaCourseServiceCrawlSentenceKafkaInput): Promise<void> {
    const { sentenceId, tenantId } = data;
    this.logger.log(`Starting crawl sentences: ${sentenceId}`);
    try {
      const entity = await this.dataServices.sentenceService.findById({
        tenantId,
        id: sentenceId,
      });
      if (!entity) {
        this.logger.error(`Entity not found for sentence ${sentenceId} and tenant ${tenantId}`);
        return;
      }
      const updateData = await this.crawlSentenceService.crawlSentence(entity);
      if (Object.keys(updateData).length > 0) {
        await this.dataServices.sentenceService.updateOne({
          id: entity._id,
          tenantId,
          update: { item: updateData },
        });
      }
      this.logger.log(`Successfully processed crawl sentence event for ${sentenceId}`);
    } catch (error) {
      this.logger.error(
        `Error processing crawl sentence event for ${sentenceId}: ${error.message}`,
      );
    }
  }
}
