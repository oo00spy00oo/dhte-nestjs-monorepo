import { ITenantGenericRepository } from '@zma-nestjs-monorepo/zma-repositories';

import {
  UserCollectionEntity,
  LessonEntity,
  LessonOrderEntity,
  SentenceEntity,
  SentenceTranslationEntity,
  TopicEntity,
  TopicOrderEntity,
  LessonSpeakingEntity,
  AnalyzeEntity,
  HistoryEntity,
  HistorySpeakingEntity,
  HistoryLessonEntity,
} from '../../frameworks/data-services/mongo/entities';

export abstract class IDataServices {
  abstract sentenceService: ITenantGenericRepository<SentenceEntity>;
  abstract sentenceTranslationService: ITenantGenericRepository<SentenceTranslationEntity>;
  abstract userCollectionService: ITenantGenericRepository<UserCollectionEntity>;
  abstract topicService: ITenantGenericRepository<TopicEntity>;
  abstract topicOrderService: ITenantGenericRepository<TopicOrderEntity>;
  abstract lessonService: ITenantGenericRepository<LessonEntity>;
  abstract lessonOrderService: ITenantGenericRepository<LessonOrderEntity>;
  abstract lessonSpeakingService: ITenantGenericRepository<LessonSpeakingEntity>;
  abstract analyzeService: ITenantGenericRepository<AnalyzeEntity>;
  abstract historyService: ITenantGenericRepository<HistoryEntity>;
  abstract historySpeakingService: ITenantGenericRepository<HistorySpeakingEntity>;
  abstract historyLessonService: ITenantGenericRepository<HistoryLessonEntity>;
}
