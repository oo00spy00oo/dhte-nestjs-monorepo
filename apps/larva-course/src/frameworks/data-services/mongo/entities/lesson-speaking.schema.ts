import { Schema as NestSchema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import mongoose from 'mongoose';
import { Document, SchemaTypes } from 'mongoose';

import { LarvaCourseServiceCourseStatus } from '../../../../core/types';

@NestSchema({
  collection: 'lesson_speakings',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class LessonSpeakingEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  lessonId: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  word?: {
    partOfSpeech: string;
    word: string;
  };

  @Prop({ type: SchemaTypes.UUID })
  sentenceId?: string;

  @Prop({ type: String })
  status: LarvaCourseServiceCourseStatus;

  @Prop({ type: SchemaTypes.UUID, required: true })
  tenantId: string;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;
}

export type LessonSpeakingDocument = LessonSpeakingEntity & Document;
export const LessonSpeakingSchema = SchemaFactory.createForClass(LessonSpeakingEntity);
