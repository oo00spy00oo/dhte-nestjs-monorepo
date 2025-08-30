import { Injectable } from '@nestjs/common';

import {
  LarvaCourseServiceAnalyzeGqlOutput,
  LarvaCourseServiceHistoryLessonGqlOutput,
} from '../../core/outputs';
@Injectable()
export class AnalyzeFactoryService {
  transform({
    entity,
    mark,
    historyLesson,
  }: {
    entity: LarvaCourseServiceAnalyzeGqlOutput;
    mark?: number;
    historyLesson?: LarvaCourseServiceHistoryLessonGqlOutput;
  }): LarvaCourseServiceAnalyzeGqlOutput {
    const analyzeWord: LarvaCourseServiceAnalyzeGqlOutput = {
      originalText: entity.originalText,
      comparisonText: entity.comparisonText,
      analyzeCompareWord: entity.analyzeCompareWord,
      analyzeWordPhonetics: entity.analyzeWordPhonetics,
      analyzeSentence: entity.analyzeSentence,
      mark: mark || 0,
      historyLesson: historyLesson || null,
    };
    return analyzeWord;
  }
}
