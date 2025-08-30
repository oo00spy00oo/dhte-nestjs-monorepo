import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ITenantGenericRepository,
  TenantMongoGenericRepository,
} from '@zma-nestjs-monorepo/zma-repositories';
import { Model } from 'mongoose';

import { IDataServices } from '../../../core';

import {
  SentenceDocument,
  SentenceEntity,
  UserCollectionDocument,
  UserCollectionEntity,
  LessonEntity,
  LessonDocument,
  LessonOrderEntity,
  LessonOrderDocument,
  TopicEntity,
  TopicDocument,
  TopicOrderEntity,
  TopicOrderDocument,
  LessonSpeakingEntity,
  LessonSpeakingDocument,
  SentenceTranslationEntity,
  SentenceTranslationDocument,
  AnalyzeEntity,
  AnalyzeDocument,
  HistoryEntity,
  HistoryDocument,
  HistorySpeakingEntity,
  HistorySpeakingDocument,
  HistoryLessonEntity,
  HistoryLessonDocument,
} from './entities';

@Injectable()
export class MongoDataServices implements IDataServices, OnApplicationBootstrap {
  sentenceService: ITenantGenericRepository<SentenceEntity>;
  sentenceTranslationService: ITenantGenericRepository<SentenceTranslationEntity>;
  userCollectionService: ITenantGenericRepository<UserCollectionEntity>;
  lessonService: ITenantGenericRepository<LessonEntity>;
  lessonOrderService: ITenantGenericRepository<LessonOrderEntity>;
  topicService: ITenantGenericRepository<TopicEntity>;
  topicOrderService: ITenantGenericRepository<TopicOrderEntity>;
  lessonSpeakingService: ITenantGenericRepository<LessonSpeakingEntity>;
  analyzeService: ITenantGenericRepository<AnalyzeEntity>;
  historyService: ITenantGenericRepository<HistoryEntity>;
  historySpeakingService: ITenantGenericRepository<HistorySpeakingEntity>;
  historyLessonService: ITenantGenericRepository<HistoryLessonEntity>;
  constructor(
    @InjectModel(SentenceEntity.name)
    private sentenceRepository: Model<SentenceDocument>,
    @InjectModel(SentenceTranslationEntity.name)
    private sentenceTranslationRepository: Model<SentenceTranslationDocument>,
    @InjectModel(UserCollectionEntity.name)
    private userCollectionRepository: Model<UserCollectionDocument>,
    @InjectModel(LessonEntity.name)
    private lessonRepository: Model<LessonDocument>,
    @InjectModel(LessonOrderEntity.name)
    private lessonOrderRepository: Model<LessonOrderDocument>,
    @InjectModel(TopicEntity.name)
    private topicRepository: Model<TopicDocument>,
    @InjectModel(TopicOrderEntity.name)
    private topicOrderRepository: Model<TopicOrderDocument>,
    @InjectModel(LessonSpeakingEntity.name)
    private lessonSpeakingRepository: Model<LessonSpeakingDocument>,
    @InjectModel(AnalyzeEntity.name)
    private analyzeRepository: Model<AnalyzeDocument>,
    @InjectModel(HistoryEntity.name)
    private historyRepository: Model<HistoryDocument>,
    @InjectModel(HistorySpeakingEntity.name)
    private historySpeakingRepository: Model<HistorySpeakingDocument>,
    @InjectModel(HistoryLessonEntity.name)
    private historyLessonRepository: Model<HistoryLessonDocument>,
  ) {}

  onApplicationBootstrap() {
    this.sentenceService = new TenantMongoGenericRepository(this.sentenceRepository);
    this.sentenceTranslationService = new TenantMongoGenericRepository(
      this.sentenceTranslationRepository,
    );
    this.userCollectionService = new TenantMongoGenericRepository(this.userCollectionRepository);
    this.lessonService = new TenantMongoGenericRepository(this.lessonRepository);
    this.lessonOrderService = new TenantMongoGenericRepository(this.lessonOrderRepository);
    this.topicService = new TenantMongoGenericRepository(this.topicRepository);
    this.topicOrderService = new TenantMongoGenericRepository(this.topicOrderRepository);
    this.lessonSpeakingService = new TenantMongoGenericRepository(this.lessonSpeakingRepository);
    this.analyzeService = new TenantMongoGenericRepository(this.analyzeRepository);
    this.historyService = new TenantMongoGenericRepository(this.historyRepository);
    this.historySpeakingService = new TenantMongoGenericRepository(this.historySpeakingRepository);
    this.historyLessonService = new TenantMongoGenericRepository(this.historyLessonRepository);
  }
}
