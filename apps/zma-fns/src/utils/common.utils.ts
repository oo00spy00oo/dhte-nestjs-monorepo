import { SurveyQuestionType } from '@zma-nestjs-monorepo/zma-types';

import {
  FnsServiceAnswerGqlInput,
  FnsServiceCreateUserResponseFormGqlInput,
  FnsServiceCreateUserResponseSurveyGqlInput,
} from '../core/inputs';
import {
  FormEntity,
  QuestionEntity,
  SurveyEntity,
} from '../frameworks/data-services/mongo/entities';

export class CommonUtils {
  private static validateRequiredAnswers({
    answers,
    questions,
  }: {
    answers: FnsServiceAnswerGqlInput[];
    questions: QuestionEntity[];
  }): void {
    const answered = new Set(answers.map((a) => a.questionId));
    const required = questions.filter((q) => q.isActive && q.isRequired).map((q) => q.questionId);

    const missing = required.filter((id) => !answered.has(id));
    if (missing.length) {
      throw new Error(`Missing required questions: ${missing.join(', ')}`);
    }
  }

  private static validateQuestionExistsAndActive({
    questionId,
    question,
  }: {
    questionId: string;
    question?: QuestionEntity;
  }): void {
    if (!question || !question.isActive) {
      throw new Error(`Invalid or inactive question: ${questionId}`);
    }
  }

  private static validateAnswerByType({
    questionId,
    answer,
    question,
  }: {
    questionId: string;
    answer: string[];
    question: QuestionEntity;
  }): void {
    const { type, options = [], minValue, maxValue } = question;

    switch (type) {
      case SurveyQuestionType.SingleChoice:
        if (answer.length !== 1) {
          throw new Error(`Single choice question ${questionId} must have exactly one answer`);
        }
        if (options.length && !options.includes(answer[0])) {
          throw new Error(`Invalid option for answer ${questionId}`);
        }
        break;
      case SurveyQuestionType.MultipleChoice:
        if (!answer.every((opt) => options.includes(opt))) {
          throw new Error(`Invalid options for answer ${questionId}`);
        }
        break;
      case SurveyQuestionType.Rating: {
        if (answer.length !== 1) {
          throw new Error(`Rating question ${questionId} must have exactly one value`);
        }
        const num = Number(answer[0]);
        if ((minValue && num < minValue) || (maxValue && num > maxValue)) {
          throw new Error(`Rating out of range for answer ${questionId}`);
        }
        break;
      }
      default:
        break;
    }
  }
  static validateUserResponse({
    entity,
    input,
  }: {
    entity: SurveyEntity | FormEntity;
    input: FnsServiceCreateUserResponseSurveyGqlInput | FnsServiceCreateUserResponseFormGqlInput;
  }): void {
    const questions = entity.questions || [];
    const questionsMap = new Map(questions.map((q) => [q.questionId, q]));

    this.validateRequiredAnswers({
      answers: input.answers,
      questions,
    });

    for (const { questionId, answer } of input.answers) {
      const question = questionsMap.get(questionId);
      this.validateQuestionExistsAndActive({ questionId, question });
      this.validateAnswerByType({ questionId, answer, question });
    }
  }
}
