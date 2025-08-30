import { Injectable } from '@nestjs/common';

import {
  LarvaCourseServiceHistoryLessonGqlOutput,
  LarvaCourseServiceLessonGqlOutput,
  LarvaCourseServiceLessonsGqlOutput,
  LarvaCourseServiceLessonSpeakingGqlOutput,
  LarvaCourseServiceSentenceGqlOutput,
  LarvaCourseServiceTopicGqlOutput,
  LessonWordGqlOutput,
} from '../../core/outputs';
import { LessonSpeakingEntity, LessonEntity } from '../../frameworks/data-services/mongo/entities';

@Injectable()
export class LessonFactoryService {
  transform({
    entity,
    totalLessonInfos,
    totalLessonInfosPass,
    lessonInfo,
    historyLesson,
    topic,
    order,
  }: {
    entity: LessonEntity;
    totalLessonInfos?: number;
    totalLessonInfosPass?: number;
    lessonInfo?: LarvaCourseServiceLessonSpeakingGqlOutput[];
    historyLesson?: LarvaCourseServiceHistoryLessonGqlOutput;
    topic?: LarvaCourseServiceTopicGqlOutput;
    order?: number;
  }): LarvaCourseServiceLessonGqlOutput {
    const lesson: LarvaCourseServiceLessonGqlOutput = {
      id: entity._id,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      tenantId: entity.tenantId,
      image: entity.image,
      logo: entity.logo,
      level: entity.level,
      topicId: entity.topicId,
      createdAt: entity.createdAt || new Date(),
      updatedAt: entity.updatedAt || new Date(),
      totalLessonInfos: totalLessonInfos || 0,
      totalLessonInfosPass: totalLessonInfosPass,
      lessonInfo: lessonInfo || null,
      historyLesson: historyLesson || null,
      topic,
      order: order || 0,
    };
    return lesson;
  }

  transformMany({
    entities,
    total,
  }: {
    entities: ReturnType<typeof this.transform>[];
    total: number;
  }): LarvaCourseServiceLessonsGqlOutput {
    return {
      data: entities,
      total,
    };
  }
}

@Injectable()
export class LessonSpeakingFactoryService {
  transform({
    entity,
    word,
    sentence,
    categoryCode,
    mark,
  }: {
    entity: LessonSpeakingEntity;
    word?: LessonWordGqlOutput;
    sentence?: LarvaCourseServiceSentenceGqlOutput;
    categoryCode?: string;
    mark?: number;
  }): LarvaCourseServiceLessonSpeakingGqlOutput {
    const lesson: LarvaCourseServiceLessonSpeakingGqlOutput = {
      id: entity._id,
      status: entity.status,
      tenantId: entity.tenantId,
      lessonId: entity.lessonId,
      word,
      sentenceId: entity.sentenceId,
      createdAt: entity.createdAt || new Date(),
      updatedAt: entity.updatedAt || new Date(),
      sentence,
      categoryCode,
      mark,
    };
    return lesson;
  }
}
