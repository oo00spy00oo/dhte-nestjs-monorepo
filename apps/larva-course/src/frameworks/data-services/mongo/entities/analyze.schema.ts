import { Schema as NestSchema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import mongoose, { Document, SchemaTypes } from 'mongoose';

import { LarvaCourseServiceAnalyzeType } from '../../../../core/types';

export type AnalyzeDocument = AnalyzeEntity & Document;

@NestSchema({
  collection: 'analyze',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class AnalyzeEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  tenantId: string;

  @Prop({ type: String, enum: LarvaCourseServiceAnalyzeType, required: true })
  analyzeType: LarvaCourseServiceAnalyzeType;

  @Prop({ type: String, required: true })
  originalText!: string;

  @Prop({ type: String, required: true })
  comparisonText!: string;

  @Prop({ type: String, required: false })
  comparisonPhonetics?: string;

  @Prop({ type: String, required: false })
  originalPhonetics?: string;

  @Prop({ type: String, required: false })
  conceptToStudy?: string;

  @Prop({ type: String, required: false })
  exampleSentence?: string;

  @Prop({ type: String, required: true })
  generalFeedback: string;

  @Prop({ type: String, required: true })
  mainSuggestion: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: false, default: [] })
  phonemeAnalysis?: {
    correctPhoneme: string;
    isCorrect: boolean;
    studentPhoneme: string;
    tip: string;
  }[];

  @Prop({ type: mongoose.Schema.Types.Mixed, required: false, default: [] })
  sentenceAnalysis?: {
    comparisonWord: string;
    isWordCorrect: boolean;
    originalWord: string;
    phonemeAnalysis: {
      comparisonPhoneme: string;
      isCorrect: boolean;
      originalPhoneme: string;
      tip: string;
    }[];
  }[];

  @Prop({ type: [String], required: true })
  practiceWords: string[];

  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;
}

export const AnalyzeSchema = SchemaFactory.createForClass(AnalyzeEntity);
