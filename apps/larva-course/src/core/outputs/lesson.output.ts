import { Field, ObjectType } from '@nestjs/graphql';
import { FindManyOutput, LanguageEnum } from '@zma-nestjs-monorepo/zma-types';

import {
  LarvaCourseServiceHistoryLessonGqlOutput,
  LarvaCourseServiceSentenceGqlOutput,
  LarvaCourseServiceTopicGqlOutput,
} from '../outputs';
import { LarvaCourseServiceCefrLevel, LarvaCourseServiceCourseStatus } from '../types';

@ObjectType()
class LessonWordImageGqlOutput {
  @Field(() => String, { nullable: true })
  url?: string;

  @Field(() => String, { nullable: true })
  caption?: string;
}

@ObjectType()
class LessonWordVideoGqlOutput {
  @Field(() => String, { nullable: true })
  url?: string;

  @Field(() => String, { nullable: true })
  caption?: string;
}

@ObjectType()
class LessonWordPronunciationGqlOutput {
  @Field(() => String, { nullable: true })
  phoneticSpelling?: string;

  @Field(() => String, { nullable: true })
  simplePhonetic?: string;

  @Field(() => String, { nullable: true })
  audioUrl?: string;

  @Field(() => String, { nullable: true })
  dialect?: string;

  @Field(() => String, { nullable: true })
  region?: string;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => String, { nullable: true })
  audioKey?: string;
}

@ObjectType()
class LessonWordLanguageDefinitionGqlOutput {
  @Field(() => String, { nullable: true })
  definition?: string;

  @Field(() => LanguageEnum, { nullable: true })
  lang?: LanguageEnum;
}

@ObjectType()
class LessonWordDefinitionGqlOutput {
  @Field(() => [LessonWordLanguageDefinitionGqlOutput], { nullable: true })
  languageDefinitions?: LessonWordLanguageDefinitionGqlOutput[];
}

@ObjectType()
class LessonWordSenseGqlOutput {
  @Field(() => Number, { nullable: true })
  senseNumber?: number;

  @Field(() => [LessonWordDefinitionGqlOutput], { nullable: true })
  definitions?: LessonWordDefinitionGqlOutput[];

  @Field(() => [String], { nullable: true })
  labels?: string[];

  @Field(() => [String], { nullable: true })
  grammar?: string[];

  @Field(() => [String], { nullable: true })
  domain?: string[];
}

@ObjectType()
class LessonWordTranslationGqlOutput {
  @Field(() => LanguageEnum, { nullable: true })
  lang?: LanguageEnum;

  @Field(() => String, { nullable: true })
  translation?: string;
}

@ObjectType()
export class LessonWordGqlOutput {
  @Field(() => String, { nullable: true })
  word?: string;

  @Field(() => String, { nullable: true })
  partOfSpeech?: string;

  @Field(() => Boolean, { nullable: true })
  hasAudio?: boolean;

  @Field(() => Boolean, { nullable: true })
  hasImage?: boolean;

  @Field(() => [LessonWordImageGqlOutput], { nullable: true })
  images?: LessonWordImageGqlOutput[];

  @Field(() => [LessonWordVideoGqlOutput], { nullable: true })
  videos?: LessonWordVideoGqlOutput[];

  @Field(() => [LessonWordPronunciationGqlOutput], { nullable: true })
  pronunciations?: LessonWordPronunciationGqlOutput[];

  @Field(() => [LessonWordSenseGqlOutput], { nullable: true })
  senses?: LessonWordSenseGqlOutput[];

  @Field(() => [LessonWordTranslationGqlOutput], { nullable: true })
  wordTranslations?: LessonWordTranslationGqlOutput[];
}

@ObjectType()
export class LarvaCourseServiceLessonSpeakingGqlOutput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  lessonId?: string;

  @Field(() => LessonWordGqlOutput, { nullable: true })
  word?: LessonWordGqlOutput;

  @Field(() => String, { nullable: true })
  sentenceId?: string;

  @Field(() => LarvaCourseServiceCourseStatus, { nullable: true })
  status?: LarvaCourseServiceCourseStatus;

  @Field(() => String, { nullable: true })
  tenantId?: string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => LarvaCourseServiceSentenceGqlOutput, { nullable: true })
  sentence?: LarvaCourseServiceSentenceGqlOutput;

  @Field(() => String, { nullable: true })
  categoryCode?: string;

  @Field(() => Number, { nullable: true })
  mark?: number;
}
@ObjectType()
export class LarvaCourseServiceLessonGqlOutput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => Number, { nullable: true })
  order?: number;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  image?: string;

  @Field(() => String, { nullable: true })
  logo?: string;

  @Field(() => LarvaCourseServiceCefrLevel, { nullable: true })
  level?: LarvaCourseServiceCefrLevel;

  @Field(() => String, { nullable: true })
  topicId?: string;

  @Field(() => LarvaCourseServiceCourseStatus, { nullable: true })
  status?: LarvaCourseServiceCourseStatus;

  @Field(() => String, { nullable: true })
  tenantId?: string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => Number, { nullable: true })
  totalLessonInfos?: number;

  @Field(() => Number, { nullable: true })
  totalLessonInfosPass?: number;

  @Field(() => [LarvaCourseServiceLessonSpeakingGqlOutput], { nullable: true })
  lessonInfo?: LarvaCourseServiceLessonSpeakingGqlOutput[];

  @Field(() => LarvaCourseServiceHistoryLessonGqlOutput, { nullable: true })
  historyLesson?: LarvaCourseServiceHistoryLessonGqlOutput;

  @Field(() => LarvaCourseServiceTopicGqlOutput, { nullable: true })
  topic?: LarvaCourseServiceTopicGqlOutput;
}

@ObjectType()
export class LarvaCourseServiceLessonsGqlOutput extends FindManyOutput(
  LarvaCourseServiceLessonGqlOutput,
) {}

export class LarvaCourseServiceLessonOutput extends LarvaCourseServiceLessonGqlOutput {}

@ObjectType({ description: 'Lesson word' })
export class LarvaCourseServiceSearchLessonWordGqlOutput {
  @Field(() => LessonWordGqlOutput, { nullable: true })
  word?: LessonWordGqlOutput;

  @Field(() => String, { nullable: true })
  lessonSpeakingId?: string;
}

@ObjectType({ description: 'Lesson sentence' })
export class LarvaCourseServiceSearchLessonSentenceGqlOutput {
  @Field(() => LarvaCourseServiceSentenceGqlOutput, { nullable: true })
  sentence?: LarvaCourseServiceSentenceGqlOutput;

  @Field(() => String, { nullable: true })
  lessonSpeakingId?: string;
}
