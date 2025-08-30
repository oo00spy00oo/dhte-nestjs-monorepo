import { Schema as NestSchema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import mongoose, { Document, SchemaTypes } from 'mongoose';

import { LarvaCourseServiceCourseStatus } from '../../../../core/types';

export type SentenceDocument = SentenceEntity & Document;

export class WordOfSentenceEntity {
  position: number;
  pronunciation: string;
  word: string;
  audioUrl?: string;
}

@NestSchema({
  collection: 'sentences',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class SentenceEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  tenantId: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  pronunciationText: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  words: WordOfSentenceEntity[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  videos?: { url: string; caption?: string }[];

  @Prop({
    type: String,
    enum: LarvaCourseServiceCourseStatus,
    default: LarvaCourseServiceCourseStatus.Active,
  })
  status?: LarvaCourseServiceCourseStatus; // e.g., 'ACTIVE', 'INACTIVE'

  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;
}

export const SentenceSchema = SchemaFactory.createForClass(SentenceEntity);
