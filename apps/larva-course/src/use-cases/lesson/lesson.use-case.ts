import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc } from '@nestjs/microservices';
import { DictionaryService, FnsService } from '@zma-nestjs-monorepo/zma-grpc';
import { Exception } from '@zma-nestjs-monorepo/zma-middlewares';
import {
  DictionaryServiceSubject,
  FnsServiceSubject,
  MicroserviceInput,
  Pagination,
  ServiceName,
} from '@zma-nestjs-monorepo/zma-types';
import { DictionaryServiceInputMapper } from '@zma-nestjs-monorepo/zma-types/mappers/dictionary';
import { FnsServiceInputMapper } from '@zma-nestjs-monorepo/zma-types/mappers/fns';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import mongoose from 'mongoose';
import { firstValueFrom } from 'rxjs';

import { appConfiguration } from '../../configuration/app.configuration';
import { IDataServices } from '../../core/abstracts';
import {
  LarvaCourseServiceCreateLessonGqlInput,
  LarvaCourseServiceGetNearlyLessonsGqlInput,
  LarvaCourseServiceSearchLessonGqlInput,
  LarvaCourseServiceSearchLessonSentenceGqlInput,
  LarvaCourseServiceSearchLessonWordGqlInput,
  LarvaCourseServiceUpdateLessonGqlInput,
} from '../../core/inputs';
import {
  LarvaCourseServiceHistoryLessonGqlOutput,
  LarvaCourseServiceLessonGqlOutput,
  LarvaCourseServiceLessonsGqlOutput,
  LarvaCourseServiceSearchLessonSentenceGqlOutput,
  LarvaCourseServiceSearchLessonWordGqlOutput,
  LarvaCourseServiceSentenceTranslationGqlOutput,
} from '../../core/outputs';
import {
  LarvaCourseServiceCefrLevel,
  LarvaCourseServiceCourseStatus,
  LarvaCourseServiceHistoryLessonStatus,
} from '../../core/types';
import { LessonEntity } from '../../frameworks/data-services/mongo/entities';
import { CrawlWordService } from '../../services/crawl-services/crawl-word.service';
import { LessonOrderUseCase } from '../lesson-order/lesson-order.use-case';
import { SentenceFactoryService } from '../sentence/sentence-factory.use-case.service';

import {
  LessonFactoryService,
  LessonSpeakingFactoryService,
} from './lesson-factory.use-case.service';
@Injectable()
export class LessonUseCase {
  private dictionaryService: DictionaryService;
  private fnsService: FnsService;
  constructor(
    private dataServices: IDataServices,
    private lessonOrderService: LessonOrderUseCase,
    private factoryService: LessonFactoryService,
    @Inject(ServiceName.DICTIONARY) private dictionaryClientGrpc: ClientGrpc,
    @Inject(ServiceName.FNS) private fnsClientGrpc: ClientGrpc,
    private lessonSpeakingFactoryService: LessonSpeakingFactoryService,
    private sentenceFactoryService: SentenceFactoryService,
    private crawlService: CrawlWordService,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    this.dictionaryService = this.dictionaryClientGrpc.getService<DictionaryService>(
      ServiceName.DICTIONARY,
    );
    this.fnsService = this.fnsClientGrpc.getService<FnsService>(ServiceName.FNS);
  }

  async getLessonById({
    id,
    tenantId,
  }: {
    id: string;
    tenantId: string;
  }): Promise<LarvaCourseServiceLessonGqlOutput> {
    const entity = await this.dataServices.lessonService.findById({ id, tenantId });

    if (!entity) {
      throw new Exception('Lesson not found');
    }

    return this.factoryService.transform({ entity });
  }

  async getLessonsByIds({
    ids,
    pagination,
    tenantId,
  }: {
    ids: string[];
    pagination: Pagination;
    tenantId: string;
  }): Promise<LarvaCourseServiceLessonGqlOutput[]> {
    const { skip, limit } = pagination;
    const entities = await this.dataServices.lessonService.findMany({
      tenantId,
      find: {
        filter: {
          _id: { $in: ids },
        },
      },
      options: {
        sort: { createdAt: -1 },
        limit,
        skip,
      },
    });
    return entities.map((entity) => this.factoryService.transform({ entity }));
  }

  async createLessonSpeaking({
    tenantId,
    input,
  }: {
    tenantId: string;
    input: LarvaCourseServiceCreateLessonGqlInput;
  }): Promise<boolean> {
    const topic = await this.dataServices.topicService.findOne({
      tenantId,
      find: {
        filter: { _id: input.topicId },
      },
    });

    if (!topic) {
      throw new Exception('Topic not found');
    }

    let newLessonSpeaking = [];
    if (topic.categoryCode == 'ENGLISH_SPEAKING_WORD') {
      if (!input.words || (input.words && input.words.length === 0)) {
        throw new Exception('Words is required');
      } else {
        // Check words exist in dictionary
        const existingWord = await firstValueFrom(
          this.dictionaryService.dictionaryServiceSearchDictionariesByWordAndPos(
            new MicroserviceInput<
              DictionaryServiceInputMapper<DictionaryServiceSubject.SearchDictionariesByWordAndPos>
            >({
              requestId: IdUtils.uuidv7(),
              data: {
                wordAndPosInputs: input.words.map((word) => ({
                  word: word.word,
                  partOfSpeech: word.partOfSpeech,
                })),
              },
            }),
          ),
        );
        if (!existingWord) {
          throw new Exception('Some words do not exist');
        }
        // Add crawl words to job queue
        this.crawlService.crawlWords(existingWord.data);
        newLessonSpeaking = existingWord.data.map((word) => ({
          word: {
            word: word.word,
            partOfSpeech: word.partOfSpeech,
          },
        }));
      }
    }

    if (topic.categoryCode == 'ENGLISH_SPEAKING_SENTENCE') {
      if (!input.sentences || (input.sentences && input.sentences.length === 0)) {
        throw new Exception('Sentences is required');
      } else {
        // Check sentences exist
        const existingSentences = await this.dataServices.sentenceService.findMany({
          tenantId,
          find: { filter: { _id: { $in: input.sentences } } },
        });

        if (existingSentences.length !== input.sentences.length) {
          throw new Exception('Some sentences do not exist');
        }
        newLessonSpeaking = input.sentences.map((sentence) => ({
          sentenceId: sentence,
        }));
      }
    }
    const newLesson = {
      ...input,
      tenantId,
      status: LarvaCourseServiceCourseStatus.Active,
    };

    const lesson = await this.dataServices.lessonService.create({
      item: newLesson,
      tenantId,
    });

    await this.insertLessonToLessonOrder({
      tenantId,
      topicId: input.topicId,
      lesson,
      order: input.order,
    });

    newLessonSpeaking = newLessonSpeaking.map((lessonSpeaking) => {
      return {
        ...lessonSpeaking,
        tenantId,
        status: LarvaCourseServiceCourseStatus.Active,
        lessonId: lesson._id,
      };
    });

    //create in database english speaking
    const lessonSpeaking = await this.dataServices.lessonSpeakingService.createMany({
      items: newLessonSpeaking,
      tenantId,
    });

    return !!lesson && !!lessonSpeaking;
  }

  async updateLessonSpeaking({
    tenantId,
    id,
    input,
  }: {
    tenantId: string;
    id: string;
    input: LarvaCourseServiceUpdateLessonGqlInput;
  }): Promise<boolean> {
    const lesson = await this.dataServices.lessonService.findOne({
      tenantId,
      find: { filter: { _id: id } },
    });

    if (!lesson) {
      throw new Exception('Lesson not found');
    }

    const topic = await this.dataServices.topicService.findOne({
      tenantId,
      find: {
        filter: { _id: lesson.topicId },
      },
    });

    if (!topic) {
      throw new Exception('Topic not found');
    }

    const lessonSpeaking = await this.dataServices.lessonSpeakingService.findMany({
      tenantId,
      find: {
        filter: {
          lessonId: lesson._id,
        },
      },
    });

    let newLessonSpeaking = [];
    let inactiveLessonSpeakingIds = [];
    let activeLessonSpeakingIds = [];
    if (topic.categoryCode == 'ENGLISH_SPEAKING_WORD') {
      if (!input.words || (input.words && input.words.length === 0)) {
        throw new Exception('Words is required');
      } else {
        // Check words exist in dictionary
        const existingWord = await firstValueFrom(
          this.dictionaryService.dictionaryServiceSearchDictionariesByWordAndPos(
            new MicroserviceInput<
              DictionaryServiceInputMapper<DictionaryServiceSubject.SearchDictionariesByWordAndPos>
            >({
              requestId: IdUtils.uuidv7(),
              data: {
                wordAndPosInputs: input.words.map((word) => ({
                  word: word.word,
                  partOfSpeech: word.partOfSpeech,
                })),
              },
            }),
          ),
        );
        if (!existingWord) {
          throw new Exception('Some words do not exist');
        }
        // Add crawl words to job queue
        this.crawlService.crawlWords(existingWord.data);
        newLessonSpeaking = existingWord.data.map((word) => ({
          word: {
            word: word.word,
            partOfSpeech: word.partOfSpeech,
          },
        }));
      }
      if (lessonSpeaking.length > 0) {
        //check skip word of input if is in lessonSpeaking, create newLessonSpeaking if not.
        newLessonSpeaking = newLessonSpeaking.filter((word) => {
          return !lessonSpeaking.some(
            (es) =>
              es.word.word === word.word.word && es.word.partOfSpeech === word.word.partOfSpeech,
          );
        });

        //If word of lessonSpeaking is not in input, create inactiveEnglishSpeaking to update status to inactive it.
        inactiveLessonSpeakingIds = lessonSpeaking
          .filter((lessonSpeaking) => {
            return !input.words.some(
              (word) =>
                word.word === lessonSpeaking.word.word &&
                word.partOfSpeech === lessonSpeaking.word.partOfSpeech,
            );
          })
          .map((lessonSpeaking) => lessonSpeaking._id);

        //if word of lessonSpeaking is in input word and have status different from active, create activeEnglishSpeaking to update status to active it.
        activeLessonSpeakingIds = lessonSpeaking
          .filter((lessonSpeaking) => {
            return input.words.some(
              (word) =>
                word.word === lessonSpeaking.word.word &&
                word.partOfSpeech === lessonSpeaking.word.partOfSpeech &&
                lessonSpeaking.status != LarvaCourseServiceCourseStatus.Active,
            );
          })
          .map((lessonSpeaking) => lessonSpeaking._id);
      }
    }

    if (topic.categoryCode == 'ENGLISH_SPEAKING_SENTENCE') {
      if (!input.sentences || (input.sentences && input.sentences.length === 0)) {
        throw new Exception('Sentences is required');
      } else {
        // Check sentences exist
        const existingSentences = await this.dataServices.sentenceService.findMany({
          tenantId,
          find: { filter: { _id: { $in: input.sentences } } },
        });

        if (existingSentences.length !== input.sentences.length) {
          throw new Exception('Some sentences do not exist');
        }
        newLessonSpeaking = input.sentences.map((sentence) => ({
          sentenceId: sentence,
        }));
      }
      if (lessonSpeaking.length > 0) {
        //check skip sentence of input if is in lessonSpeaking, create newLessonSpeaking if not.
        newLessonSpeaking = input.sentences
          .filter((sentence) => {
            return !lessonSpeaking.some((lessonSpeaking) => lessonSpeaking.sentenceId == sentence);
          })
          .map((sentence) => ({
            sentenceId: sentence,
          }));

        //If sentence of lessonSpeaking is not in input, create inactiveEnglishSpeaking to update status to inactive it.
        inactiveLessonSpeakingIds = lessonSpeaking
          .filter((lessonSpeaking) => {
            return !input.sentences.some((sentence) => sentence == lessonSpeaking.sentenceId);
          })
          .map((lessonSpeaking) => lessonSpeaking._id);

        //if sentence of lessonSpeaking is in input sentence and have status different from active, create activeEnglishSpeaking to update status to active it.
        activeLessonSpeakingIds = lessonSpeaking
          .filter((lessonSpeaking) => {
            return input.sentences.some(
              (sentence) =>
                sentence == lessonSpeaking.sentenceId &&
                lessonSpeaking.status != LarvaCourseServiceCourseStatus.Active,
            );
          })
          .map((lessonSpeaking) => lessonSpeaking._id);
      }
    }

    await this.dataServices.lessonSpeakingService.updateMany({
      tenantId,
      filter: { _id: { $in: activeLessonSpeakingIds } },
      update: {
        item: { status: LarvaCourseServiceCourseStatus.Active },
      },
    });

    await this.dataServices.lessonSpeakingService.updateMany({
      tenantId,
      filter: { _id: { $in: inactiveLessonSpeakingIds } },
      update: {
        item: { status: LarvaCourseServiceCourseStatus.Inactive },
      },
    });

    const entity = await this.dataServices.lessonService.updateOne({
      tenantId,
      id,
      update: { item: input },
    });

    if (newLessonSpeaking.length > 0) {
      newLessonSpeaking = newLessonSpeaking.map((lessonSpeaking) => {
        return {
          ...lessonSpeaking,
          tenantId,
          status: LarvaCourseServiceCourseStatus.Active,
          lessonId: lesson._id,
        };
      });
      await this.dataServices.lessonSpeakingService.createMany({
        items: newLessonSpeaking,
        tenantId,
      });
    }

    if (input.order)
      await this.insertLessonToLessonOrder({
        tenantId,
        topicId: topic._id,
        lesson,
        order: input.order,
      });

    return !!entity;
  }

  async getLessonSpeakingById({
    tenantId,
    id,
    userId,
  }: {
    tenantId: string;
    id: string;
    userId: string;
  }): Promise<LarvaCourseServiceLessonGqlOutput> {
    const lesson = await this.dataServices.lessonService.findById({ id, tenantId });

    if (!lesson) {
      throw new Exception('Lesson not found');
    }

    const topic = await this.dataServices.topicService.findOne({
      tenantId,
      find: {
        filter: {
          _id: lesson.topicId,
          status: LarvaCourseServiceCourseStatus.Active,
        },
      },
    });

    if (!topic) {
      throw new Exception('Topic not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipeline: any[] = [
      {
        $match: {
          lessonId: new mongoose.Types.UUID(lesson._id),
          status: LarvaCourseServiceCourseStatus.Active,
        },
      },
    ];
    if (topic.categoryCode == 'ENGLISH_SPEAKING_SENTENCE') {
      pipeline.push(
        {
          $lookup: {
            from: 'sentences',
            localField: 'sentenceId',
            foreignField: '_id',
            as: 'sentence',
            pipeline: [
              {
                $match: {
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
            ],
          },
        },
        {
          $unwind: { path: '$sentence', preserveNullAndEmptyArrays: true },
        },
      );
    }

    const entity = await this.dataServices.lessonSpeakingService.aggregate({
      pipeline,
    });
    const historyLesson = await this.dataServices.historyLessonService.aggregate({
      pipeline: [
        {
          $match: {
            lessonId: new mongoose.Types.UUID(lesson._id),
            userId: new mongoose.Types.UUID(userId),
          },
        },
        {
          $sort: { createdAt: -1 },
        },

        {
          $limit: 1,
        },
      ],
    });

    const wordsToFetch = entity.reduce((acc, { word }) => {
      if (word && word.word && word.partOfSpeech)
        acc.push({ word: word.word, partOfSpeech: word.partOfSpeech });
      return acc;
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dictPronunciationMap: Record<string, any> = {};
    if (wordsToFetch.length > 0) {
      try {
        const dictResult = await firstValueFrom(
          this.dictionaryService.dictionaryServiceSearchDictionariesByWordAndPos(
            new MicroserviceInput<
              DictionaryServiceInputMapper<DictionaryServiceSubject.SearchDictionariesByWordAndPos>
            >({
              requestId: IdUtils.uuidv7(),
              data: { wordAndPosInputs: wordsToFetch },
            }),
          ),
        );
        if (dictResult && dictResult.data && Array.isArray(dictResult.data)) {
          dictPronunciationMap = dictResult.data.reduce((acc, item) => {
            acc[`${item.word}__${item.partOfSpeech}`] = item;
            return acc;
          }, {});
        }
      } catch (err) {
        dictPronunciationMap = {};
      }
    }

    const lessonInfo = entity.map((lessonSpeaking) => {
      const sentence = lessonSpeaking.sentence
        ? this.sentenceFactoryService.transform({
            entity: lessonSpeaking.sentence,
            translations: lessonSpeaking.sentence
              .translations as LarvaCourseServiceSentenceTranslationGqlOutput[],
          })
        : null;

      let wordDetails = lessonSpeaking.word || null;
      if (lessonSpeaking.word) {
        const dictKey = `${lessonSpeaking.word.word}__${lessonSpeaking.word.partOfSpeech}`;
        const dictEntry = dictPronunciationMap[dictKey];
        if (dictEntry && dictEntry.pronunciations) {
          wordDetails = {
            ...lessonSpeaking.word,
            pronunciations: dictEntry.pronunciations,
            wordTranslations: dictEntry.wordTranslations,
            videos: dictEntry.videos,
          };
        }
      }
      const mark =
        historyLesson && historyLesson.length > 0
          ? historyLesson[0].lessonSpeakings.find((el) => {
              return el.lessonSpeakingId.toString() === lessonSpeaking._id.toString();
            })?.mark
          : null;
      return this.lessonSpeakingFactoryService.transform({
        entity: lessonSpeaking,
        word: wordDetails,
        sentence,
        categoryCode: topic.categoryCode,
        mark,
      });
    });
    return this.factoryService.transform({
      entity: lesson,
      totalLessonInfos: lessonInfo.length,
      lessonInfo,
    });
  }

  async searchLessonsSpeaking({
    tenantId,
    input,
    pagination,
    userId,
  }: {
    tenantId: string;
    input: LarvaCourseServiceSearchLessonGqlInput;
    pagination: Pagination;
    userId: string;
  }): Promise<LarvaCourseServiceLessonsGqlOutput> {
    const { limit, skip } = pagination;
    const { topicId, name, level } = input;
    const filter: any = {
      tenantId: new mongoose.Types.UUID(tenantId),
    };

    const surveyId = appConfiguration(this.configService).surveys.onboarding.english.surveyId;
    const questionId = appConfiguration(this.configService).surveys.onboarding.english.questionId;
    try {
      const userResponse = await firstValueFrom(
        this.fnsService.fnsServiceFindUserResponse(
          new MicroserviceInput<FnsServiceInputMapper<FnsServiceSubject.FindUserResponse>>({
            requestId: IdUtils.uuidv7(),
            data: { userId, tenantId, surveyId },
          }),
        ),
      );
      const userLevel =
        userResponse.answers.find((answer) => answer.questionId === questionId)?.answer?.[0] ??
        null;
      if (userLevel) {
        const cefrLevels = Object.values(LarvaCourseServiceCefrLevel);
        const userLevelIndex = cefrLevels.findIndex((level) => userLevel.includes(level));
        if (userLevelIndex !== -1) {
          const userLevelEnums = cefrLevels.slice(userLevelIndex);
          filter.level = { $in: userLevelEnums };
        }
      }
    } catch (error) {
      console.log(error);
    }

    filter.topicId = new mongoose.Types.UUID(topicId);
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    if (level) {
      filter.level = { $regex: level, $options: 'i' };
    }
    const pipeline: any[] = [
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'topics',
          localField: 'topicId',
          foreignField: '_id',
          as: 'topic',
        },
      },
      {
        $unwind: { path: '$topic', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'history_lessons',
          localField: '_id',
          foreignField: 'lessonId',
          as: 'historyLesson',
          pipeline: [
            {
              $match: {
                userId: new mongoose.Types.UUID(userId),
              },
            },
            {
              $sort: { createdAt: -1 },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $unwind: { path: '$historyLesson', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'lesson_speakings',
          localField: '_id',
          foreignField: 'lessonId',
          as: 'lessonInfo',
          pipeline: [
            {
              $match: {
                status: LarvaCourseServiceCourseStatus.Active,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          totalLessonInfos: {
            $size: '$lessonInfo',
          },
        },
      },
      {
        $project: {
          lessonInfo: 0,
        },
      },
    ];

    // Get topic order for the category if specified
    let lessonIds: string[] = [];
    if (topicId) {
      try {
        const lessonOrder = await this.dataServices.lessonOrderService.findOne({
          tenantId,
          find: {
            filter: {
              topicId,
              status: LarvaCourseServiceCourseStatus.Active,
            },
          },
        });
        lessonIds = lessonOrder?.lessonIds || [];
      } catch (error) {
        // If topic order service is not available, continue without ordering
        console.warn('Lesson order service not available, using default ordering');
      }
    }

    // Add ordering based on topic order if available
    if (lessonIds.length > 0) {
      pipeline.push({
        $addFields: {
          order: {
            $add: [{ $indexOfArray: [lessonIds, '$_id'] }, 1],
          },
        },
      });
      pipeline.push({
        $sort: {
          order: 1,
          createdAt: -1,
        },
      });
    } else {
      pipeline.push({
        $sort: { createdAt: -1 },
      });
    }

    pipeline.push({
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: 'count' }],
      },
    });

    const entity = await this.dataServices.lessonService.aggregate({
      pipeline,
    });

    const lessons = entity[0].data.map((lesson) => {
      return this.factoryService.transform({
        entity: lesson,
        totalLessonInfos: lesson.totalLessonInfos,
        totalLessonInfosPass: lesson.historyLesson
          ? lesson.historyLesson.lessonSpeakings.filter(
              (lessonSpeaking) => lessonSpeaking.mark >= 70,
            ).length
          : 0,
        lessonInfo: [],
        historyLesson: lesson.historyLesson,
        order: lesson.order,
      });
    });
    return this.factoryService.transformMany({
      entities: lessons,
      total: entity[0]?.total?.[0]?.count ?? 0,
    });
  }

  async getLessonSpeakingSummary({
    tenantId,
    userId,
    lessonId,
  }: {
    tenantId: string;
    userId: string;
    lessonId: string;
  }): Promise<LarvaCourseServiceHistoryLessonGqlOutput> {
    const historyLesson = await this.dataServices.historyLessonService.findOne({
      tenantId,
      find: {
        filter: {
          userId: new mongoose.Types.UUID(userId),
          lessonId: new mongoose.Types.UUID(lessonId),
        },
      },
    });

    if (!historyLesson) {
      throw new Exception('History lesson not found');
    }

    return historyLesson;
  }

  async getNearlyLessons({
    tenantId,
    input,
    userId,
  }: {
    tenantId: string;
    input: LarvaCourseServiceGetNearlyLessonsGqlInput;
    userId: string;
  }): Promise<LarvaCourseServiceLessonGqlOutput[]> {
    const pipeline = [
      {
        $match: {
          userId: new mongoose.Types.UUID(userId),
          tenantId: new mongoose.Types.UUID(tenantId),
          status: LarvaCourseServiceHistoryLessonStatus.InProgress,
        },
      },
      {
        $lookup: {
          from: 'lessons',
          localField: 'lessonId',
          foreignField: '_id',
          as: 'lesson',
          pipeline: [
            {
              $match: {
                status: LarvaCourseServiceCourseStatus.Active,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$lesson',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'topics',
          localField: 'lesson.topicId',
          foreignField: '_id',
          as: 'topic',
          pipeline: [
            {
              $match: {
                status: LarvaCourseServiceCourseStatus.Active,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$topic',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $sort: { updatedAt: -1 },
      },
      {
        $limit: input.total,
      },
      {
        $project: {
          _id: '$lessonId',
          name: '$lesson.name',
          description: '$lesson.description',
          image: '$lesson.image',
          logo: '$lesson.logo',
          level: '$lesson.level',
          status: '$lesson.status',
          topic: 1,
          lessonSpeakings: 1,
          totalLessonInfos: { $size: '$lessonSpeakings' },
        },
      },
    ];

    const entities = await this.dataServices.historyLessonService.aggregate({ pipeline });

    return entities.map((entity) => {
      const totalLessonInfosPass =
        entity.lessonSpeakings?.filter((speaking) => speaking.mark >= 70).length ?? 0;

      return this.factoryService.transform({
        entity,
        totalLessonInfos: entity.totalLessonInfos,
        totalLessonInfosPass,
        topic: entity.topic,
      });
    });
  }

  private async insertLessonToLessonOrder({
    tenantId,
    topicId,
    lesson,
    order,
  }: {
    tenantId: string;
    topicId: string;
    lesson: LessonEntity;
    order: number;
  }): Promise<void> {
    // Get lesson order for the topic if specified
    const lessonOrder = await this.dataServices.lessonOrderService.findOne({
      tenantId,
      find: {
        filter: {
          topicId,
          status: LarvaCourseServiceCourseStatus.Active,
        },
      },
    });

    // Insert the new lesson at the correct position based on the input order,
    // Remove lessonId if it already exists to avoid duplicates.
    // If lessonOrder is not found, create a new one with the lessonIds array containing only the new lesson.
    const lessonIds = lessonOrder
      ? [...lessonOrder.lessonIds.filter((id) => String(id) !== String(lesson._id))]
      : [];

    if (lessonOrder) {
      const insertIndex = Math.max(0, Math.min(order - 1, lessonIds.length));
      lessonIds.splice(insertIndex, 0, lesson._id);
    } else {
      lessonIds.push(lesson._id);
    }
    await this.lessonOrderService.createOrUpdateLessonOrder({
      tenantId,
      input: {
        topicId,
        lessonIds,
      },
    });
  }

  async searchLessonWords({
    tenantId,
    input,
    pagination,
  }: {
    tenantId: string;
    input: LarvaCourseServiceSearchLessonWordGqlInput;
    pagination: Pagination;
    userId: string;
  }): Promise<LarvaCourseServiceSearchLessonWordGqlOutput[]> {
    const { limit, skip } = pagination;
    const { word } = input;
    // Validate input
    if (!word || typeof word !== 'string' || !word.trim()) {
      throw new Exception('Word is required for search');
    }
    const lessonSpeakings = await this.dataServices.lessonSpeakingService.findMany({
      tenantId,
      find: {
        filter: {
          'word.word': { $regex: new RegExp(word, 'i') },
        },
      },
      options: {
        sort: { createdAt: -1 },
        limit,
        skip,
      },
    });

    const wordsToFetch = lessonSpeakings.reduce<{ word: string; partOfSpeech: string }[]>(
      (acc, { word }) => {
        if (word && word.word && word.partOfSpeech) {
          acc.push({ word: word.word, partOfSpeech: word.partOfSpeech });
        }
        return acc;
      },
      [],
    );

    let dictPronunciationMap: Record<string, any> = {};
    if (wordsToFetch.length > 0) {
      try {
        const dictResult = await firstValueFrom(
          this.dictionaryService.dictionaryServiceSearchDictionariesByWordAndPos(
            new MicroserviceInput<
              DictionaryServiceInputMapper<DictionaryServiceSubject.SearchDictionariesByWordAndPos>
            >({
              requestId: IdUtils.uuidv7(),
              data: { wordAndPosInputs: wordsToFetch },
            }),
          ),
        );
        if (dictResult && dictResult.data && Array.isArray(dictResult.data)) {
          dictPronunciationMap = dictResult.data.reduce((acc, item) => {
            acc[`${item.word}__${item.partOfSpeech}`] = item;
            return acc;
          }, {});
        }
      } catch (err) {
        dictPronunciationMap = {};
      }
    }
    const entities = lessonSpeakings.map((lessonSpeaking) => {
      let wordDetails = lessonSpeaking.word || null;
      if (lessonSpeaking.word) {
        const dictKey = `${lessonSpeaking.word.word}__${lessonSpeaking.word.partOfSpeech}`;
        const dictEntry = dictPronunciationMap[dictKey];
        if (dictEntry) {
          wordDetails = {
            ...lessonSpeaking.word,
            ...(dictEntry.pronunciations && { pronunciations: dictEntry.pronunciations }),
            ...(dictEntry.wordTranslations && { wordTranslations: dictEntry.wordTranslations }),
            ...(dictEntry.videos && { videos: dictEntry.videos }),
          };
        }
      }
      return {
        word: wordDetails,
        lessonSpeakingId: lessonSpeaking._id.toString(),
      };
    });
    return entities;
  }

  async searchLessonSentences({
    tenantId,
    input,
    pagination,
  }: {
    tenantId: string;
    input: LarvaCourseServiceSearchLessonSentenceGqlInput;
    pagination: Pagination;
    userId: string;
  }): Promise<LarvaCourseServiceSearchLessonSentenceGqlOutput[]> {
    const { limit, skip } = pagination;
    const { content } = input;
    // Validate input
    if (!content || typeof content !== 'string' || !content.trim()) {
      throw new Exception('Content is required for search');
    }
    // Aggregate lessonSpeaking to sentence to get content
    const lessonSpeakings = await this.dataServices.lessonSpeakingService.aggregate({
      pipeline: [
        {
          $match: { tenantId: new mongoose.Types.UUID(tenantId) },
        },
        {
          $lookup: {
            from: 'sentences',
            localField: 'sentenceId',
            foreignField: '_id',
            as: 'sentence',
            pipeline: [
              {
                $lookup: {
                  from: 'sentence_translations',
                  localField: '_id',
                  foreignField: 'sentenceId',
                  as: 'translations',
                },
              },
              {
                $match: {
                  status: LarvaCourseServiceCourseStatus.Active,
                },
              },
            ],
          },
        },
        {
          $unwind: { path: '$sentence', preserveNullAndEmptyArrays: true },
        },
        {
          $match: {
            'sentence.content': { $regex: new RegExp(content, 'i') },
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ],
    });

    const sentences = lessonSpeakings.map((lessonSpeaking) => {
      const sentence = this.sentenceFactoryService.transform({
        entity: lessonSpeaking.sentence,
        translations: lessonSpeaking.sentence
          .translations as LarvaCourseServiceSentenceTranslationGqlOutput[],
      });
      return {
        sentence,
        lessonSpeakingId: lessonSpeaking._id.toString(),
      };
    });

    return sentences;
  }
}
