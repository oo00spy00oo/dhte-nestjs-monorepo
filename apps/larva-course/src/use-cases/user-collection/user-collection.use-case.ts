import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc } from '@nestjs/microservices';
import { DictionaryService } from '@zma-nestjs-monorepo/zma-grpc';
import { Exception } from '@zma-nestjs-monorepo/zma-middlewares';
import {
  MicroserviceInput,
  Pagination,
  DictionaryServiceSubject,
  ServiceName,
  ErrorCode,
} from '@zma-nestjs-monorepo/zma-types';
import {
  DictionaryServiceInputMapper,
  DictionaryServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/dictionary';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { firstValueFrom } from 'rxjs';

import { appConfiguration } from '../../configuration';
import { IDataServices } from '../../core/abstracts';
import {
  LarvaCourseServiceChangeItemsOfCollectionGqlInput,
  LarvaCourseServiceCreateUserCollectionGqlInput,
  LarvaCourseServiceSearchCollectionOfUserGqlInput,
  SentenceInput,
  WordInput,
} from '../../core/inputs';
import {
  LarvaCourseServiceDetailUserCollectionGqlOutput,
  LarvaCourseServiceGeneralUserCollectionGqlOutput,
} from '../../core/outputs';
import { LarvaCourseServiceCourseStatus } from '../../core/types';
import { UserCollectionEntity } from '../../frameworks/data-services/mongo/entities';
import { SentenceUseCase } from '../sentence/sentence.use-case';

import { UserCollectionFactoryService } from './user-collection-factory.use-case.service';

@Injectable()
export class UserCollectionUseCase {
  private dictionaryService: DictionaryService;
  private logger = new Logger(UserCollectionUseCase.name);
  private appConfig;
  constructor(
    private dataServices: IDataServices,
    private factoryService: UserCollectionFactoryService,
    @Inject(ServiceName.DICTIONARY) private dictionaryClientGrpc: ClientGrpc,
    private configService: ConfigService,
    private sentenceUseCase: SentenceUseCase,
  ) {
    this.appConfig = appConfiguration(this.configService);
  }

  onModuleInit() {
    this.dictionaryService = this.dictionaryClientGrpc.getService<DictionaryService>(
      ServiceName.DICTIONARY,
    );
  }

  private deduplicateSentences(sentences: SentenceInput[]): SentenceInput[] {
    // return [...new Set(ids)];
    return Array.from(
      new Map(
        sentences.map((item) => [`${item.sentenceId}-${item.lessonSpeakingId}`, item]),
      ).values(),
    );
  }

  private deduplicateWords(words: WordInput[]): WordInput[] {
    return Array.from(
      new Map(
        words.map((item) => [`${item.word}-${item.partOfSpeech}-${item.lessonSpeakingId}`, item]),
      ).values(),
    );
  }

  private async getDictionariesByWordAndPos(
    wordAndPosInputs: WordInput[],
  ): Promise<DictionaryServiceOutputMapper<DictionaryServiceSubject.SearchDictionariesByWordAndPos> | null> {
    try {
      const microserviceInput = new MicroserviceInput<
        DictionaryServiceInputMapper<DictionaryServiceSubject.SearchDictionariesByWordAndPos>
      >({
        requestId: IdUtils.uuidv7(),
        data: {
          wordAndPosInputs: wordAndPosInputs.map((word) => ({
            word: word.word,
            partOfSpeech: word.partOfSpeech,
          })),
        },
      });
      const existingWords = await firstValueFrom(
        this.dictionaryService.dictionaryServiceSearchDictionariesByWordAndPos(microserviceInput),
      );
      return existingWords;
    } catch (error) {
      this.logger.error(
        `Error fetching words from dictionary service: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  private async validateUserCollectionsLimit({
    userId,
    tenantId,
  }: {
    userId: string;
    tenantId: string;
  }) {
    const existingCollections = await this.dataServices.userCollectionService.findMany({
      tenantId,
      find: {
        filter: { userId, isDeleted: false },
      },
    });

    const limit = this.appConfig.maxCollectionPerUser;
    if (existingCollections.length >= limit) {
      throw new Exception(ErrorCode.USER_COLLECTIONS_LIMIT_REACHED);
    }
  }

  private async validateCollectionItems({
    words,
    sentences,
    tenantId,
  }: {
    words: WordInput[];
    sentences: SentenceInput[];
    tenantId: string;
  }) {
    const itemLimit = this.appConfig.maxCollectionItem;
    const totalItems = words.length + sentences.length;

    if (totalItems > itemLimit) {
      throw new Exception(ErrorCode.ITEMS_PER_COLLECTION_LIMIT_REACHED);
    }

    // Collect unique lessonSpeakingIds
    const lessonIds = [
      ...new Set([
        ...words.map((w) => w.lessonSpeakingId),
        ...sentences.map((s) => s.lessonSpeakingId),
      ]),
    ];

    const lessonSpeakings = await this.dataServices.lessonSpeakingService.findMany({
      tenantId,
      find: {
        filter: {
          _id: { $in: lessonIds },
          status: LarvaCourseServiceCourseStatus.Active,
        },
      },
    });

    const lessonMap = new Map(lessonSpeakings.map((l) => [l._id.toString(), l]));

    // Validate sentences
    for (const s of sentences) {
      const lesson = lessonMap.get(s.lessonSpeakingId);
      if (!lesson) throw new Exception(ErrorCode.LESSON_SPEAKING_NOT_FOUND);
      if (lesson.sentenceId.toString() !== s.sentenceId) {
        throw new Exception(ErrorCode.SENTENCE_NOT_BELONG_TO_LESSON_SPEAKING);
      }
    }

    // Validate words
    for (const w of words) {
      const lesson = lessonMap.get(w.lessonSpeakingId);
      if (!lesson) throw new Exception(ErrorCode.LESSON_SPEAKING_NOT_FOUND);
      if (
        !lesson.word ||
        lesson.word.word !== w.word ||
        lesson.word.partOfSpeech !== w.partOfSpeech
      ) {
        throw new Exception(ErrorCode.WORD_NOT_BELONG_TO_LESSON_SPEAKING);
      }
    }
  }

  private async getUserCollection({
    id,
    userId,
    tenantId,
  }: {
    id: string;
    userId: string;
    tenantId: string;
  }): Promise<UserCollectionEntity> {
    const collection = await this.dataServices.userCollectionService.findOne({
      tenantId,
      find: {
        filter: {
          _id: id,
          userId,
          isDeleted: false,
        },
      },
    });

    return collection;
  }

  async getCollectionById({
    id,
    tenantId,
  }: {
    id: string;
    tenantId: string;
  }): Promise<LarvaCourseServiceDetailUserCollectionGqlOutput> {
    const entity = await this.dataServices.userCollectionService.findById({ id, tenantId });

    if (!entity || entity.isDeleted) {
      throw new Exception(ErrorCode.USER_COLLECTION_NOT_FOUND);
    }

    const sentencesInput = (entity.sentences || []).map((s) => ({
      sentenceId: s.sentenceId.toString(),
      lessonSpeakingId: s.lessonSpeakingId.toString(),
    }));

    const wordsInput = (entity.words || []).map((w) => ({
      word: w.word,
      partOfSpeech: w.partOfSpeech,
      lessonSpeakingId: w.lessonSpeakingId.toString(),
    }));

    const sentenceIds = sentencesInput.map((s) => s.sentenceId);

    const [sentences, dictionaryWords] = await Promise.all([
      sentenceIds.length > 0
        ? this.sentenceUseCase.getSentences({
            ids: sentenceIds,
            tenantId,
            pagination: { skip: 0, limit: sentenceIds.length },
          })
        : Promise.resolve([]),
      wordsInput.length > 0
        ? this.getDictionariesByWordAndPos(wordsInput)
        : Promise.resolve({ data: [] }),
    ]);

    const sentenceMap = new Map(sentences.map((s) => [s.id.toString(), s]));
    const wordMap = new Map(dictionaryWords.data.map((w) => [`${w.word}-${w.partOfSpeech}`, w]));

    const sentencesExpanded = sentencesInput.flatMap((input) => {
      const sentence = sentenceMap.get(input.sentenceId);
      return sentence ? [{ ...sentence, lessonSpeakingId: input.lessonSpeakingId }] : [];
    });
    const wordsExpanded = wordsInput.flatMap((input) => {
      const key = `${input.word}-${input.partOfSpeech}`;
      const word = wordMap.get(key);
      return word ? [{ ...word, lessonSpeakingId: input.lessonSpeakingId }] : [];
    });

    return this.factoryService.transformDetail({
      entity,
      sentences: sentencesExpanded,
      words: wordsExpanded,
    });
  }

  async getCollectionsByIds({
    ids,
    pagination,
    tenantId,
  }: {
    ids: string[];
    pagination: Pagination;
    tenantId: string;
  }): Promise<LarvaCourseServiceGeneralUserCollectionGqlOutput[]> {
    const { skip, limit } = pagination;
    const entities = await this.dataServices.userCollectionService.findMany({
      tenantId,
      find: {
        filter: {
          _id: { $in: ids },
          isDeleted: false,
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

  async getCollectionsOfUser({
    userId,
    pagination,
    tenantId,
  }: {
    userId: string;
    pagination: Pagination;
    tenantId: string;
  }): Promise<LarvaCourseServiceGeneralUserCollectionGqlOutput[]> {
    const { skip, limit } = pagination;
    const entities = await this.dataServices.userCollectionService.findMany({
      tenantId,
      find: {
        filter: {
          userId,
          isDeleted: false,
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

  async searchCollectionsOfUser({
    userId,
    input,
    pagination,
    tenantId,
  }: {
    userId: string;
    input: LarvaCourseServiceSearchCollectionOfUserGqlInput;
    pagination: Pagination;
    tenantId: string;
  }): Promise<LarvaCourseServiceGeneralUserCollectionGqlOutput[]> {
    const { limit, skip } = pagination;
    const filter = {
      tenantId,
      userId,
      isDeleted: false,
    };
    if (input.name) {
      filter['name'] = { $regex: input.name, $options: 'i' };
    }
    const entities = await this.dataServices.userCollectionService.findMany({
      tenantId,
      find: {
        filter,
      },
      options: {
        sort: { createdAt: -1 },
        limit,
        skip,
      },
    });
    return entities.map((entity) => this.factoryService.transform(entity));
  }

  async createCollection({
    userId,
    tenantId,
    input,
  }: {
    userId: string;
    tenantId: string;
    input: LarvaCourseServiceCreateUserCollectionGqlInput;
  }): Promise<boolean> {
    const deduplicateWords = this.deduplicateWords(input.words || []);
    const deduplicateSentences = this.deduplicateSentences(input.sentences || []);
    await this.validateUserCollectionsLimit({ userId, tenantId });
    await this.validateCollectionItems({
      words: deduplicateWords,
      sentences: deduplicateSentences,
      tenantId,
    });

    const newCollection = {
      ...input,
      words: deduplicateWords,
      sentences: deduplicateSentences,
      userId,
      tenantId,
    };

    const entity = await this.dataServices.userCollectionService.create({
      item: newCollection,
      tenantId,
    });
    return !!entity;
  }

  async addItemsToCollection({
    userId,
    id,
    input,
    tenantId,
  }: {
    userId: string;
    id: string;
    input: LarvaCourseServiceChangeItemsOfCollectionGqlInput;
    tenantId: string;
  }): Promise<boolean> {
    const existingCollection = await this.getUserCollection({ id, userId, tenantId });
    if (!existingCollection) {
      throw new Exception(ErrorCode.USER_COLLECTION_NOT_FOUND);
    }

    const mergedWords = this.deduplicateWords([
      ...existingCollection.words,
      ...(input.words || []),
    ]);

    const mergedSentences = this.deduplicateSentences([
      ...existingCollection.sentences,
      ...(input.sentences || []),
    ]);

    await this.validateCollectionItems({
      words: mergedWords,
      sentences: mergedSentences,
      tenantId,
    });

    const updatedEntity = await this.dataServices.userCollectionService.updateOne({
      tenantId,
      id: existingCollection._id,
      update: {
        item: {
          words: mergedWords,
          sentences: mergedSentences,
        },
      },
    });

    return !!updatedEntity;
  }

  async removeItemsFromCollection({
    userId,
    id,
    input,
    tenantId,
  }: {
    userId: string;
    id: string;
    input: LarvaCourseServiceChangeItemsOfCollectionGqlInput;
    tenantId: string;
  }): Promise<boolean> {
    const existingCollection = await this.getUserCollection({ id, userId, tenantId });
    if (!existingCollection) {
      throw new Exception(ErrorCode.USER_COLLECTION_NOT_FOUND);
    }

    const { words: removeWords = [], sentences: removeSentences = [] } = input;

    const removeWordKeys = new Set(
      removeWords.map((w) => `${w.word}-${w.partOfSpeech}-${w.lessonSpeakingId}`),
    );

    const updatedWords = existingCollection.words.filter(
      (word) => !removeWordKeys.has(`${word.word}-${word.partOfSpeech}-${word.lessonSpeakingId}`),
    );

    const removeSentenceSet = new Set(
      removeSentences.map((s) => `${s.sentenceId}-${s.lessonSpeakingId}`),
    );
    const updatedSentences = existingCollection.sentences.filter(
      (sentence) => !removeSentenceSet.has(`${sentence.sentenceId}-${sentence.lessonSpeakingId}`),
    );

    const updatedEntity = await this.dataServices.userCollectionService.updateOne({
      tenantId,
      id: existingCollection._id,
      update: {
        item: {
          words: updatedWords,
          sentences: updatedSentences,
        },
      },
    });

    return !!updatedEntity;
  }

  async changeNameCollection({
    userId,
    id,
    name,
    tenantId,
  }: {
    userId: string;
    id: string;
    name: string;
    tenantId: string;
  }): Promise<boolean> {
    const existingCollection = await this.getUserCollection({ id, userId, tenantId });
    if (!existingCollection) {
      throw new Exception(ErrorCode.USER_COLLECTION_NOT_FOUND);
    }

    const updatedEntity = await this.dataServices.userCollectionService.updateOne({
      tenantId,
      id: existingCollection._id,
      update: {
        item: {
          name,
        },
      },
    });

    return !!updatedEntity;
  }

  async deleteCollection({
    userId,
    id,
    tenantId,
  }: {
    userId: string;
    id: string;
    tenantId: string;
  }): Promise<boolean> {
    const existingCollection = await this.getUserCollection({ id, userId, tenantId });
    if (!existingCollection) {
      throw new Exception(ErrorCode.USER_COLLECTION_NOT_FOUND);
    }

    const deletedAt = new Date();
    const updatedEntity = await this.dataServices.userCollectionService.updateOne({
      tenantId,
      id: existingCollection._id,
      update: {
        item: {
          isDeleted: true,
          deletedAt,
        },
      },
    });

    return !!updatedEntity;
  }
}
