import { Injectable } from '@nestjs/common';
import { Exception } from '@zma-nestjs-monorepo/zma-middlewares';

import { IDataServices } from '../../core/abstracts';
import { LarvaCourseServiceAnalyzeSpeakingGqlInput, AnalyzeInput } from '../../core/inputs';
import { LarvaCourseServiceAnalyzeGqlOutput } from '../../core/outputs/analyze.output';
import {
  LarvaCourseServiceCourseStatus,
  LarvaCourseServiceHistoryLessonStatus,
  LarvaCourseServiceAnalyzeStatus,
} from '../../core/types';
import { AnalyzeAiService } from '../../frameworks/ai-services/analyze/analyze.ai-service.service';
import { HistoryLessonEntity, LessonEntity } from '../../frameworks/data-services/mongo/entities';
import { speakingScoringSentence, speakingScoringWord } from '../../utils/speaking-scoring';

import { AnalyzeFactoryService } from './analyze-factory.use-case.service';

@Injectable()
export class AnalyzeUseCase {
  constructor(
    private dataServices: IDataServices,
    private factoryService: AnalyzeFactoryService,
    private analyzeAiService: AnalyzeAiService,
  ) {}

  async analyzeWord({
    userId,
    tenantId,
    input,
  }: {
    userId: string;
    tenantId: string;
    input: LarvaCourseServiceAnalyzeSpeakingGqlInput;
  }): Promise<LarvaCourseServiceAnalyzeGqlOutput> {
    const lessonSpeaking = await this.dataServices.lessonSpeakingService.findOne({
      tenantId,
      find: {
        filter: { _id: input.lessonSpeakingId },
      },
    });

    if (!lessonSpeaking) {
      throw new Exception('Lesson Speaking not found');
    }

    const lesson = await this.dataServices.lessonService.findOne({
      tenantId,
      find: {
        filter: { _id: lessonSpeaking.lessonId },
      },
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

    if (topic.categoryCode !== 'ENGLISH_SPEAKING_WORD') {
      throw new Exception('Data is not English Speaking Word');
    } else {
      if (!lessonSpeaking?.word) {
        throw new Exception('Word is required');
      }
    }

    const inputAnalyze = new AnalyzeInput();
    inputAnalyze.originalText = lessonSpeaking.word.word;
    inputAnalyze.comparisonText = input.speechToText;

    //promise all
    const [analyzeCompareWord, analyzeWordPhonetics] = await Promise.all([
      this.analyzeAiService.analyzeCompareWord({ input: inputAnalyze }),
      this.analyzeAiService.analyzeWordPhonetics({ input: inputAnalyze }),
    ]);

    if (!analyzeCompareWord || !analyzeWordPhonetics) {
      throw new Error('Failed to get analysis');
    }

    const analyze = {
      originalText: inputAnalyze.originalText,
      comparisonText: inputAnalyze.comparisonText,
      analyzeCompareWord,
      analyzeWordPhonetics,
    } as LarvaCourseServiceAnalyzeGqlOutput;

    const history = await this.dataServices.historyService.create({
      tenantId,
      item: {
        userId,
        lessonId: lesson._id,
        subjectCode: topic.subjectCode,
        skillCode: topic.skillCode,
        categoryCode: topic.categoryCode,
        tenantId,
      },
    });

    const mark = speakingScoringWord({ analyze });
    await this.dataServices.historySpeakingService.create({
      tenantId,
      item: {
        tenantId,
        historyId: history._id,
        // analyzeId: analyze._id,
        mark,
        record: input.record,
      },
    });

    const historyLesson = await this.upsertHistoryLesson({
      mark,
      input,
      lesson,
      userId,
      tenantId,
    });

    return this.factoryService.transform({
      entity: analyze,
      mark,
      historyLesson,
    });
  }

  async analyzeSentence({
    userId,
    tenantId,
    input,
  }: {
    userId: string;
    tenantId: string;
    input: LarvaCourseServiceAnalyzeSpeakingGqlInput;
  }): Promise<LarvaCourseServiceAnalyzeGqlOutput> {
    const lessonSpeaking = await this.dataServices.lessonSpeakingService.findOne({
      tenantId,
      find: {
        filter: { _id: input.lessonSpeakingId },
      },
    });

    if (!lessonSpeaking) {
      throw new Exception('Lesson Speaking not found');
    }

    const lesson = await this.dataServices.lessonService.findOne({
      tenantId,
      find: {
        filter: { _id: lessonSpeaking.lessonId },
      },
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

    if (topic.categoryCode !== 'ENGLISH_SPEAKING_SENTENCE') {
      throw new Exception('Data is not English Speaking Word');
    } else {
      if (!lessonSpeaking?.sentenceId) {
        throw new Exception('Sentence is required');
      }
    }

    const sentence = await this.dataServices.sentenceService.findOne({
      tenantId,
      find: {
        filter: { _id: lessonSpeaking.sentenceId },
      },
    });

    if (!sentence) {
      throw new Exception('Sentence not found');
    }

    const inputAnalyze = new AnalyzeInput();
    inputAnalyze.originalText = sentence.content;
    inputAnalyze.comparisonText = input.speechToText;

    const analyzeSentence = await this.analyzeAiService.analyzeSentence({ input: inputAnalyze });
    if (!analyzeSentence) {
      throw new Error('Failed to get analysis');
    }
    // Helper function to process phonetics by trimming spaces and grouping
    const processPhonetics = (phonetics) => {
      if (!Array.isArray(phonetics)) return phonetics;

      const processedPhonetics = [];

      for (const phonetic of phonetics) {
        const hasSpaceEdges =
          phonetic.value &&
          typeof phonetic.value === 'string' &&
          (phonetic.value.endsWith(' ') || phonetic.value.startsWith(' ')) &&
          phonetic.value.length > 1;

        if (hasSpaceEdges) {
          processedPhonetics.push({
            ...phonetic,
            value: phonetic.value.trim(),
          });
          processedPhonetics.push({
            expected: null,
            expectedGrapheme: null,
            grapheme: ' ',
            status: 'CORRECT',
            tips: null,
            value: ' ',
          });
        } else {
          processedPhonetics.push(phonetic);
        }
      }

      return groupBySpaces(processedPhonetics);
    };

    // Helper function to group elements by spaces
    const groupBySpaces = (elements) => {
      const groups = [];
      let currentGroup = [];

      for (const element of elements) {
        if (element.value === ' ') {
          if (currentGroup.length > 0) {
            groups.push(currentGroup);
            currentGroup = [];
          }
        } else {
          currentGroup.push(element);
        }
      }

      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }

      return groups;
    };

    // Helper function to split multi-word comparison into individual words
    const splitMultiWordComparison = (element, stringOriginalWords) => {
      const words = element.comparisonWord.split(' ');
      let originalWordIndex = 0;

      return words.map((word, index) => {
        const detailWords = element.detailWords?.[index];
        const checkWord = detailWords?.reduce((acc, w) => acc + w.expected, '') || '';

        let originalWord = '';
        if (checkWord && originalWordIndex < stringOriginalWords.length) {
          originalWord = stringOriginalWords[originalWordIndex++];
        }

        return {
          ...element,
          comparisonWord: word,
          originalWord,
          detailPhonetics: element.detailPhonetics?.[index],
          detailWords,
          status: originalWord ? element.status : 'EXTRA',
        };
      });
    };

    // Format analyze sentence - process phonetics and words grouping
    const formatAnalyzeSentence = analyzeSentence.reduce((acc, element) => {
      if (!element.originalWord || element.originalWord.length <= 1) {
        acc.push(element);
        return acc;
      }

      const processedElement = { ...element };

      // Process detailPhonetics
      if (processedElement.detailPhonetics) {
        processedElement.detailPhonetics = processPhonetics(processedElement.detailPhonetics);
      }

      // Process detailWords
      if (Array.isArray(processedElement.detailWords)) {
        processedElement.detailWords = groupBySpaces(processedElement.detailWords);
      }

      acc.push(processedElement);
      return acc;
    }, []);

    // Split multi-word comparisons into individual word elements
    const newAnalyzeSentence = formatAnalyzeSentence.reduce((acc, element) => {
      const isMultiWord = element.comparisonWord.split(' ').length > 1;
      const hasDetailArrays =
        Array.isArray(element.detailPhonetics) && Array.isArray(element.detailWords);

      if (isMultiWord && hasDetailArrays) {
        const stringOriginalWords = element.originalWord.split(' ');
        const splitResults = splitMultiWordComparison(element, stringOriginalWords);
        acc.push(...splitResults);
      } else if (!isMultiWord) {
        acc.push(element);
      }

      return acc;
    }, []);

    const analyze = {
      originalText: inputAnalyze.originalText,
      comparisonText: inputAnalyze.comparisonText,
      analyzeSentence: newAnalyzeSentence,
    } as LarvaCourseServiceAnalyzeGqlOutput;

    const history = await this.dataServices.historyService.create({
      tenantId,
      item: {
        userId,
        lessonId: lesson._id,
        subjectCode: topic.subjectCode,
        skillCode: topic.skillCode,
        categoryCode: topic.categoryCode,
        tenantId,
      },
    });
    const mark = speakingScoringSentence({ analyze });
    await this.dataServices.historySpeakingService.create({
      tenantId,
      item: {
        tenantId,
        historyId: history._id,
        // analyzeId: analyze._id,
        mark,
        record: input.record,
      },
    });

    const historyLesson = await this.upsertHistoryLesson({
      lesson,
      input,
      mark,
      userId,
      tenantId,
    });

    const formatAnalyze = analyze.analyzeSentence.map((el) => {
      let mark;
      if (el.status === LarvaCourseServiceAnalyzeStatus.Correct) {
        mark = 100;
      } else if (
        el.status === LarvaCourseServiceAnalyzeStatus.Omitted ||
        el.status === LarvaCourseServiceAnalyzeStatus.Extra
      ) {
        mark = 0;
      } else {
        mark = speakingScoringWord({ analyze: { analyzeWordPhonetics: el.detailPhonetics } });
      }
      return { ...el, mark };
    });

    return this.factoryService.transform({
      entity: {
        ...analyze,
        analyzeSentence: formatAnalyze,
      },
      mark,
      historyLesson,
    });
  }

  private async upsertHistoryLesson({
    lesson,
    input,
    mark,
    userId,
    tenantId,
  }: {
    lesson: LessonEntity;
    input: LarvaCourseServiceAnalyzeSpeakingGqlInput;
    mark: number;
    userId: string;
    tenantId: string;
  }): Promise<HistoryLessonEntity> {
    let historyLesson = await this.dataServices.historyLessonService.findOne({
      tenantId,
      find: {
        filter: {
          userId,
          lessonId: lesson._id,
          // status: LarvaCourseServiceHistoryLessonStatus.InProgress,
        },
      },
    });

    if (!historyLesson) {
      const lessonSpeakings = await this.dataServices.lessonSpeakingService.findMany({
        tenantId,
        find: {
          filter: { lessonId: lesson._id, status: LarvaCourseServiceCourseStatus.Active },
        },
      });
      const summaryMark = lessonSpeakings.length > 0 ? mark / lessonSpeakings.length : 0;
      historyLesson = await this.dataServices.historyLessonService.create({
        tenantId,
        item: {
          userId,
          lessonId: lesson._id,
          summaryMark,
          status: LarvaCourseServiceHistoryLessonStatus.InProgress,
          tenantId,
          lessonSpeakings: lessonSpeakings.map((lessonSpeaking) => ({
            lessonSpeakingId: lessonSpeaking._id,
            mark: lessonSpeaking._id === input.lessonSpeakingId ? mark : 0,
          })),
        },
      });
      return historyLesson;
    }

    const updatedLessonSpeakings = historyLesson.lessonSpeakings.map((lessonSpeaking) => {
      if (lessonSpeaking.lessonSpeakingId.toString() === input.lessonSpeakingId.toString()) {
        lessonSpeaking.mark = mark;
        return lessonSpeaking;
      }
      return lessonSpeaking;
    });
    const totalMark = updatedLessonSpeakings.reduce((sum, ls) => sum + ls.mark, 0);
    const summaryMark =
      updatedLessonSpeakings.length > 0 ? Math.round(totalMark / updatedLessonSpeakings.length) : 0;

    const checkPass = updatedLessonSpeakings.every((ls) => ls.mark >= 75);

    historyLesson = await this.dataServices.historyLessonService.updateOne({
      tenantId,
      id: historyLesson._id,
      update: {
        item: {
          summaryMark,
          lessonSpeakings: updatedLessonSpeakings,
          status:
            summaryMark >= 75 && checkPass
              ? LarvaCourseServiceHistoryLessonStatus.Completed
              : LarvaCourseServiceHistoryLessonStatus.InProgress,
        },
      },
    });
    return historyLesson;
  }
}
