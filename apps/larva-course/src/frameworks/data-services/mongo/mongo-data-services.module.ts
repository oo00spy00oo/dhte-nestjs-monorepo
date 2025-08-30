import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { IDataServices } from '../../../core';

import {
  SentenceEntity,
  SentenceSchema,
  UserCollectionEntity,
  UserCollectionSchema,
  LessonEntity,
  LessonSchema,
  LessonOrderEntity,
  LessonOrderSchema,
  TopicEntity,
  TopicSchema,
  TopicOrderEntity,
  TopicOrderSchema,
  LessonSpeakingEntity,
  LessonSpeakingSchema,
  SentenceTranslationEntity,
  SentenceTranslationSchema,
  AnalyzeEntity,
  AnalyzeSchema,
  HistoryEntity,
  HistorySchema,
  HistorySpeakingEntity,
  HistorySpeakingSchema,
  HistoryLessonEntity,
  HistoryLessonSchema,
} from './entities';
import { MongoDataServices } from './mongo-data-services.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SentenceEntity.name, schema: SentenceSchema },
      { name: SentenceTranslationEntity.name, schema: SentenceTranslationSchema },
      { name: UserCollectionEntity.name, schema: UserCollectionSchema },
      { name: LessonEntity.name, schema: LessonSchema },
      { name: LessonOrderEntity.name, schema: LessonOrderSchema },
      { name: TopicEntity.name, schema: TopicSchema },
      { name: TopicOrderEntity.name, schema: TopicOrderSchema },
      { name: LessonSpeakingEntity.name, schema: LessonSpeakingSchema },
      { name: AnalyzeEntity.name, schema: AnalyzeSchema },
      { name: HistoryEntity.name, schema: HistorySchema },
      { name: HistorySpeakingEntity.name, schema: HistorySpeakingSchema },
      { name: HistoryLessonEntity.name, schema: HistoryLessonSchema },
    ]),
  ],
  providers: [
    {
      provide: IDataServices,
      useClass: MongoDataServices,
    },
  ],
  exports: [IDataServices],
})
export class MongoDataServicesModule {}
