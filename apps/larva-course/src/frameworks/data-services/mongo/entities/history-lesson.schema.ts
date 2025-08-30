import { Schema as NestSchema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { Document, SchemaTypes } from 'mongoose';

import { LarvaCourseServiceHistoryLessonStatus } from '../../../../core/types';

@NestSchema({
  collection: 'history_lessons',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class HistoryLessonEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  userId: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  tenantId: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  lessonId: string;

  @Prop({
    type: [
      {
        lessonSpeakingId: { type: SchemaTypes.UUID, required: true },
        mark: { type: Number, required: true, default: 0 },
        _id: false,
      },
    ],
    required: true,
  })
  lessonSpeakings: {
    lessonSpeakingId: string;
    mark: number;
  }[];

  @Prop({ type: Number, required: true })
  summaryMark: number;

  @Prop({
    type: String,
    enum: LarvaCourseServiceHistoryLessonStatus,
    default: LarvaCourseServiceHistoryLessonStatus.InProgress,
  })
  status: LarvaCourseServiceHistoryLessonStatus;
  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;
  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;
}

export type HistoryLessonDocument = HistoryLessonEntity & Document;
export const HistoryLessonSchema = SchemaFactory.createForClass(HistoryLessonEntity);
