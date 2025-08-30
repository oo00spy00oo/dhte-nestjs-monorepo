import { registerEnumType } from '@nestjs/graphql';
import { LanguageEnum } from '@zma-nestjs-monorepo/zma-types';

export enum LarvaCourseServiceHistoryLessonStatus {
  Completed = 'COMPLETED',
  InProgress = 'INPROGRESS',
}

export enum LarvaCourseServiceCourseStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED',
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Deleted = 'DELETED',
}

export enum LarvaCourseServiceSkill {
  Grammar = 'GRAMMAR',
  Vocabulary = 'VOCABULARY',
  Listening = 'LISTENING',
  Speaking = 'SPEAKING',
  Reading = 'READING',
  Writing = 'WRITING',
}

export enum LarvaCourseServiceCefrLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

export enum LarvaCourseServiceType {
  TOEIC = 'TOEIC',
  TOEFL = 'TOEFL',
  IELTS = 'IELTS',
}

export enum LarvaCourseServiceLanguage {
  En = 'en',
  Vi = 'vi',
}

export enum LarvaCourseServiceAnalyzeType {
  WORD = 'WORD',
  SENTENCE = 'SENTENCE',
}

export enum LarvaCourseServiceAnalyzeStatus {
  Correct = 'CORRECT',
  Incorrect = 'INCORRECT',
  Extra = 'EXTRA',
  Omitted = 'OMITTED',
}

registerEnumType(LarvaCourseServiceCourseStatus, {
  name: 'LarvaCourseServiceCourseStatus',
  description: 'The status of the course',
});

registerEnumType(LarvaCourseServiceSkill, {
  name: 'LarvaCourseServiceSkill',
  description: 'The type of skill',
});

registerEnumType(LarvaCourseServiceCefrLevel, {
  name: 'LarvaCourseServiceLevel',
  description: 'The level of difficulty',
});

registerEnumType(LarvaCourseServiceType, {
  name: 'LarvaCourseServiceType',
  description: 'The type of course',
});

registerEnumType(LarvaCourseServiceLanguage, {
  name: 'LarvaCourseServiceLanguage',
  description: 'The language of the sentence',
});

registerEnumType(LarvaCourseServiceAnalyzeType, {
  name: 'LarvaCourseServiceAnalyzeType',
  description: 'The type of analyze',
});

registerEnumType(LarvaCourseServiceAnalyzeStatus, {
  name: 'LarvaCourseServiceAnalyzeStatus',
  description: 'The status of the analyze',
});

registerEnumType(LarvaCourseServiceHistoryLessonStatus, {
  name: 'LarvaCourseServiceHistoryLessonStatus',
  description: 'The status of the history lesson',
});

registerEnumType(LanguageEnum, {
  name: 'LanguageEnum',
});
