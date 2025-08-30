import { Injectable, Logger } from '@nestjs/common';
import { MeiliSearch } from '@passiontech-global/nestjs-meilisearch';
import { Exception } from '@zma-nestjs-monorepo/zma-middlewares';
import {
  DictionaryServiceDictionaryStatus,
  LanguageEnum,
  Pagination,
} from '@zma-nestjs-monorepo/zma-types';
import {
  DictionaryServiceCrawlWordsForLessonKafkaInput,
  DictionaryServiceCreateDictionaryGqlInput,
  DictionaryServiceSearchByWordAndPosInput,
  DictionaryServiceSearchDictionariesInput,
  DictionaryServiceSearchManyByWordAndPosInput,
  DictionaryServiceUpdateDictionaryGqlInput,
} from '@zma-nestjs-monorepo/zma-types/inputs/dictionary';
import { DictionaryServiceDictionaryGqlOutput } from '@zma-nestjs-monorepo/zma-types/outputs/dictionary';

import { IDataServices } from '../../core/abstracts';
import {
  DictionaryServiceCrawlWordGqlInput,
  DictionaryServiceCrawlWordsGqlInput,
} from '../../core/inputs';
import { DictionaryServiceCrawlWordOutput } from '../../core/outputs/dictionary.output';
import {
  DictionaryEntity,
  DictionarySenseEntity,
  DictionaryWordTranslationEntity,
} from '../../frameworks/data-services/mongo/entities';
import { CrawlLessonService } from '../../services/crawl-service/crawl-lesson.service';
import { CrawlService } from '../../services/crawl-service/crawl.service';
import { TranslationService } from '../../services/translation-service/translation.service';
import { CommonUtils } from '../../utils';

import { DictionaryFactoryService } from './dictionary-factory.use-case.service';
@Injectable()
export class DictionaryUseCase {
  private readonly logger = new Logger(DictionaryUseCase.name);
  constructor(
    private dataServices: IDataServices,
    private factoryService: DictionaryFactoryService,
    private crawlService: CrawlService,
    private translationService: TranslationService,
    private meilisearchService: MeiliSearch,
    private crawlLessonService: CrawlLessonService,
  ) {}

  async getDictionary(id: string): Promise<DictionaryServiceDictionaryGqlOutput> {
    const entity = await this.dataServices.dictionaryService.findById({ id });

    if (!entity) {
      throw new Exception('Dictionary not found');
    }
    return this.factoryService.transform(entity);
  }

  async getDictionaries({
    ids,
    pagination,
  }: {
    ids: string[];
    pagination: Pagination;
  }): Promise<DictionaryServiceDictionaryGqlOutput[]> {
    const { skip, limit } = pagination;
    const entities = await this.dataServices.dictionaryService.findMany({
      find: {
        filter: {
          _id: { $in: ids },
          status: DictionaryServiceDictionaryStatus.Active,
        },
      },
      options: {
        sort: { createdAt: -1 },
        limit,
        skip,
      },
    });
    return entities.map((entity) => this.factoryService.transform(entity));
  }

  async getAllDictionaries(
    pagination: Pagination,
  ): Promise<DictionaryServiceDictionaryGqlOutput[]> {
    const { skip, limit } = pagination;
    const entities = await this.dataServices.dictionaryService.findMany({
      find: {
        filter: { status: DictionaryServiceDictionaryStatus.Active },
      },
      options: {
        sort: { createdAt: -1 },
        limit,
        skip,
      },
    });
    return entities.map((entity) => this.factoryService.transform(entity));
  }

  async searchDictionaryByWordAndPos({
    input,
  }: {
    input: DictionaryServiceSearchByWordAndPosInput;
  }): Promise<DictionaryServiceDictionaryGqlOutput> {
    const entity = await this.dataServices.dictionaryService.findOne({
      find: {
        filter: {
          word: input.word,
          partOfSpeech: input.partOfSpeech,
          status: DictionaryServiceDictionaryStatus.Active,
        },
      },
    });

    return this.factoryService.transform(entity);
  }

  async searchDictionariesByWordAndPos({
    input,
    pagination,
  }: {
    input: DictionaryServiceSearchManyByWordAndPosInput;
    pagination: Pagination;
  }): Promise<DictionaryServiceDictionaryGqlOutput[]> {
    const { limit, skip } = pagination;
    const { wordAndPosInputs } = input;
    const entities = await this.dataServices.dictionaryService.findMany({
      find: {
        filter: {
          $or: wordAndPosInputs.map((el) => ({
            word: el.word,
            partOfSpeech: el.partOfSpeech,
          })),
          status: DictionaryServiceDictionaryStatus.Active,
        },
      },
      options: {
        sort: { createdAt: -1 },
        limit,
        skip,
      },
    });
    return entities.map((entity) => this.factoryService.transform(entity));
  }

  async searchDictionaries({
    input,
    pagination,
  }: {
    input: DictionaryServiceSearchDictionariesInput;
    pagination: Pagination;
  }): Promise<DictionaryServiceDictionaryGqlOutput[]> {
    const { limit, skip } = pagination;
    const { word } = input;
    const entities = await this.dataServices.dictionaryService.findMany({
      find: {
        filter: {
          word,
          status: DictionaryServiceDictionaryStatus.Active,
        },
      },
      options: {
        sort: { createdAt: -1 },
        limit,
        skip,
      },
    });
    const result = entities.map((entity) => this.factoryService.transform(entity));
    return result;
  }

  async createDictionary(input: DictionaryServiceCreateDictionaryGqlInput): Promise<boolean> {
    const newDictionary = {
      ...input,
      status: DictionaryServiceDictionaryStatus.Active,
    };
    if (!newDictionary.word || !newDictionary.partOfSpeech) {
      throw new Exception('Word and part of speech are required');
    }
    const existingDictionary = await this.dataServices.dictionaryService.findOne({
      find: {
        filter: {
          word: newDictionary.word,
          partOfSpeech: newDictionary.partOfSpeech,
          status: DictionaryServiceDictionaryStatus.Active,
        },
      },
    });
    if (existingDictionary) {
      return false;
    } else {
      const entity = await this.dataServices.dictionaryService.create({ item: newDictionary });
      return !!entity;
    }
  }

  async updateDictionary({
    input,
    id,
  }: {
    input: DictionaryServiceUpdateDictionaryGqlInput;
    id: string;
  }): Promise<boolean> {
    const existingDictionary = await this.dataServices.dictionaryService.findById({ id });

    if (!existingDictionary) {
      throw new Exception(`Dictionary with id ${id} not found`);
    }
    const updatedDictionary = {
      ...input,
    };
    const entity = await this.dataServices.dictionaryService.updateOne({
      id,
      update: { item: updatedDictionary },
    });
    return !!entity;
  }

  async deleteDictionaries(ids: string[]): Promise<boolean> {
    const { modifiedCount } = await this.dataServices.dictionaryService.updateManyByIds({
      ids,
      update: {
        item: {
          status: DictionaryServiceDictionaryStatus.Deleted,
        },
      },
    });
    return !!modifiedCount;
  }

  async enableDictionaries(ids: string[]): Promise<boolean> {
    const { modifiedCount } = await this.dataServices.dictionaryService.updateManyByIds({
      ids,
      update: {
        item: {
          status: DictionaryServiceDictionaryStatus.Active,
        },
      },
    });

    return !!modifiedCount;
  }

  private async fetchWordAssets(word: DictionaryEntity) {
    const seenKeys = new Set<string>();
    const audioKeys = (word.pronunciations ?? []).reduce(
      (acc, p) => {
        if (!p.audioKey || seenKeys.has(p.audioKey)) return acc;
        seenKeys.add(p.audioKey);
        acc.push({ dialect: p.dialect, audioKey: p.audioKey });
        return acc;
      },
      [] as { dialect: string; audioKey: string }[],
    );

    return this.crawlService.fetchDictionaryPage({
      word: word.word,
      audioKeys,
      partOfSpeech: word.partOfSpeech,
    });
  }

  private async translateMissingDefinitions(
    senses: DictionarySenseEntity[],
  ): Promise<DictionarySenseEntity[]> {
    return Promise.all(
      senses.map(async (sense) => {
        const { definitions = [] } = sense;

        const updatedDefinitions = await Promise.all(
          definitions.map(async (defEntity) => {
            const { languageDefinitions = [] } = defEntity;

            if (languageDefinitions.some((langDef) => langDef.lang === LanguageEnum.VI)) {
              return defEntity;
            }

            const enDefs = languageDefinitions.filter(
              (langDef) => langDef.lang === LanguageEnum.EN,
            );
            if (!enDefs.length) return defEntity;

            const viDefs = await Promise.all(
              enDefs.map(async ({ definition }) => {
                const viText = await this.translationService.translateText({
                  text: definition,
                });

                this.logger.log(
                  `Translated definition from EN to VI: "${definition}" -> "${viText}"`,
                );

                if (!viText) return null;

                return {
                  definition: viText,
                  lang: LanguageEnum.VI,
                };
              }),
            );

            return {
              ...defEntity,
              languageDefinitions: [...languageDefinitions, ...viDefs.filter(Boolean)],
            };
          }),
        );

        return {
          ...sense,
          definitions: updatedDefinitions,
        };
      }),
    );
  }

  private async translateWord(word: DictionaryEntity): Promise<DictionaryWordTranslationEntity[]> {
    const translated = await this.translationService.translateText({
      text: word.word,
    });

    if (!translated) return word.wordTranslations ?? [];

    this.logger.log(`Translated word from EN to VI: "${word.word}" -> "${translated}"`);

    const wordTranslation: DictionaryWordTranslationEntity = {
      lang: LanguageEnum.VI,
      translation: translated,
    };

    return [...(word.wordTranslations ?? []), wordTranslation];
  }

  private hasSensesChanged(
    original: DictionarySenseEntity[],
    updated: DictionarySenseEntity[],
  ): boolean {
    return updated.some((s, i) => s !== original[i]);
  }

  async crawlWord(input: DictionaryServiceCrawlWordGqlInput): Promise<boolean> {
    const { word, partOfSpeech } = input;
    const existingWord = await this.dataServices.dictionaryService.findOne({
      find: { filter: { word, partOfSpeech } },
    });
    if (!existingWord) {
      throw new Exception('Word not found in the dictionary');
    }

    const needsImage = !existingWord.hasImage;
    const needsAudio = !existingWord.hasAudio;

    const shouldFetchAssets = needsImage || needsAudio;
    let fetchedAssets: Awaited<ReturnType<typeof this.fetchWordAssets>> | null = null;

    if (shouldFetchAssets) {
      fetchedAssets = await this.fetchWordAssets(existingWord);
    }

    const update: DictionaryServiceUpdateDictionaryGqlInput = {};

    if (needsImage && fetchedAssets?.imageUrl) {
      update.hasImage = true;
    }

    if (needsAudio && fetchedAssets?.audioUrls.length) {
      update.hasAudio = true;
    }

    const updatedSenses = await this.translateMissingDefinitions(existingWord.senses ?? []);
    if (this.hasSensesChanged(existingWord.senses ?? [], updatedSenses)) {
      update.senses = updatedSenses;
    }

    const hasVietnameseTranslation = existingWord.wordTranslations?.some(
      (wt) => wt.lang === LanguageEnum.VI,
    );

    if (!hasVietnameseTranslation) {
      const wordTranslations = await this.translateWord(existingWord);
      if (wordTranslations?.length) {
        update.wordTranslations = wordTranslations;
      }
    }

    if (!Object.keys(update).length) return true;
    await this.updateDictionary({
      id: existingWord._id,
      input: update,
    });

    return true;
  }

  async crawlWords(
    input: DictionaryServiceCrawlWordsGqlInput,
  ): Promise<DictionaryServiceCrawlWordOutput[]> {
    const { words, concurrency } = input;
    const chunks = CommonUtils.chunkArray({ arr: words, size: concurrency });

    const results: DictionaryServiceCrawlWordOutput[] = [];
    for (const chunk of chunks) {
      const promises = chunk.map(async (wordInput) => {
        try {
          const result = await this.crawlWord(wordInput);
          this.logger.log(
            `Successfully crawled word: ${wordInput.word} - ${wordInput.partOfSpeech}`,
          );
          return {
            word: wordInput.word,
            partOfSpeech: wordInput.partOfSpeech,
            isDone: result,
          };
        } catch (error) {
          this.logger.error(
            `Failed to crawl word: ${wordInput.word} - ${wordInput.partOfSpeech}`,
            error,
          );
          return {
            word: wordInput.word,
            partOfSpeech: wordInput.partOfSpeech,
            isDone: false,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });
      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults);
    }

    return results;
  }

  private async crawlWordForLesson(word: DictionaryEntity): Promise<void> {
    const updatedData = await this.crawlLessonService.crawlWordForLesson(word);
    if (Object.keys(updatedData).length > 0) {
      await this.updateDictionary({
        id: word._id,
        input: updatedData,
      });
      this.logger.log(`Updated word for lesson: ${word.word} - ${word.partOfSpeech}`);
    }
  }

  async crawlWordsForLesson(input: DictionaryServiceCrawlWordsForLessonKafkaInput): Promise<void> {
    try {
      const CONCURRENCY = 5;
      const { words } = input;

      const filter = {
        $or: words.map(({ word, partOfSpeech }) => ({ word, partOfSpeech })),
      };

      const wordEntities = await this.dataServices.dictionaryService.findMany({
        find: { filter },
      });

      const chunks = CommonUtils.chunkArray({
        arr: wordEntities,
        size: CONCURRENCY,
      });

      for (const chunk of chunks) {
        const results = await Promise.allSettled(
          chunk.map((word) => this.crawlWordForLesson(word)),
        );

        results.forEach((result, idx) => {
          if (result.status === 'rejected') {
            const { word, partOfSpeech } = chunk[idx];
            this.logger.error(`Failed for "${word}" (${partOfSpeech}): ${result.reason}`);
          }
        });
      }
    } catch (error) {
      this.logger.error(`Failed to process words for lesson:`, error);
    }
  }
}
