import { Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

import { LarvaCourseServiceHistoryLessonGqlOutput } from '../outputs';
@ObjectType()
export class AnalyzeWordPhonemeAnalysisGqlOutput {
  @Field(() => String)
  correctPhoneme!: string;

  @Field(() => Boolean)
  isCorrect!: boolean;

  @Field(() => String)
  studentPhoneme!: string;

  @Field(() => String)
  tip!: string;
}

@ObjectType()
export class AnalyzeSentencePhonemeAnalysisGqlOutput {
  @Field(() => String)
  comparisonPhoneme!: string;

  @Field(() => Boolean)
  isCorrect!: boolean;

  @Field(() => String)
  originalPhoneme!: string;

  @Field(() => String)
  tip!: string;
}

@ObjectType()
export class AnalyzeSentenceGqlOutput {
  @Field(() => String)
  comparisonWord!: string;

  @Field(() => Boolean)
  isWordCorrect!: boolean;

  @Field(() => String)
  originalWord!: string;

  @Field(() => [AnalyzeSentencePhonemeAnalysisGqlOutput])
  phonemeAnalysis!: AnalyzeSentencePhonemeAnalysisGqlOutput[];
}
@ObjectType()
export class LarvaCourseServiceAnalyzeCompareWordOutput {
  @Field(() => String, { nullable: true })
  expected?: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  value?: string;
}

@ObjectType()
export class LarvaCourseServiceAnalyzeWordPhoneticsOutput {
  @Field(() => String, { nullable: true })
  expected?: string;

  @Field(() => String, { nullable: true })
  expectedGrapheme?: string;

  @Field(() => String, { nullable: true })
  grapheme?: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  tips?: string;

  @Field(() => String, { nullable: true })
  value?: string;
}

@ObjectType()
export class LarvaCourseServiceAnalyzeSentenceDetailOutput {
  @Field(() => [LarvaCourseServiceAnalyzeCompareWordOutput], { nullable: true })
  detailWords?: LarvaCourseServiceAnalyzeCompareWordOutput[];

  @Field(() => [LarvaCourseServiceAnalyzeWordPhoneticsOutput], { nullable: true })
  detailPhonetics?: LarvaCourseServiceAnalyzeWordPhoneticsOutput[];

  @Field(() => String, { nullable: true })
  comparisonWord?: string;

  @Field(() => String, { nullable: true })
  originalWord?: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => Number, { nullable: true })
  mark?: number;
}

@ObjectType()
export class LarvaCourseServiceAnalyzeGqlOutput {
  @Field(() => String, { nullable: true })
  originalText?: string;

  @Field(() => String, { nullable: true })
  comparisonText?: string;

  @Field(() => [LarvaCourseServiceAnalyzeCompareWordOutput], { nullable: true })
  analyzeCompareWord?: LarvaCourseServiceAnalyzeCompareWordOutput[];

  @Field(() => [LarvaCourseServiceAnalyzeWordPhoneticsOutput], { nullable: true })
  analyzeWordPhonetics?: LarvaCourseServiceAnalyzeWordPhoneticsOutput[];

  @Field(() => [LarvaCourseServiceAnalyzeSentenceDetailOutput], { nullable: true })
  analyzeSentence?: LarvaCourseServiceAnalyzeSentenceDetailOutput[];

  @Field(() => Number, { nullable: true })
  mark?: number;

  @Field(() => LarvaCourseServiceHistoryLessonGqlOutput, { nullable: true })
  historyLesson?: LarvaCourseServiceHistoryLessonGqlOutput;
}

@ObjectType()
export class LarvaCourseServiceAnalyzeOutput extends LarvaCourseServiceAnalyzeGqlOutput {}

export class LarvaCourseServiceText2SpeechOutput {
  @IsString()
  @IsNotEmpty()
  url!: string;
}

export class LarvaCourseServiceLipSyncOutput {
  @IsString()
  @IsNotEmpty()
  url!: string;
}

export class LarvaCourseServiceTranslateOutput {
  @IsString()
  @IsNotEmpty()
  message!: string;
}
