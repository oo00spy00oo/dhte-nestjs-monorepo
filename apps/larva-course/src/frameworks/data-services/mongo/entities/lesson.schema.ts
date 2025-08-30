import { Schema as NestSchema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { Document, SchemaTypes } from 'mongoose';

import {
  LarvaCourseServiceCefrLevel,
  LarvaCourseServiceCourseStatus,
} from '../../../../core/types';

@NestSchema({
  collection: 'lessons',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class LessonEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: String, required: false })
  image?: string;

  @Prop({ type: String, required: false })
  logo?: string;

  @Prop({
    type: String,
    enum: LarvaCourseServiceCefrLevel,
    required: false,
  })
  level!: LarvaCourseServiceCefrLevel;

  @Prop({ type: SchemaTypes.UUID, required: true })
  topicId!: string;

  @Prop({
    type: String,
    enum: LarvaCourseServiceCourseStatus,
    default: LarvaCourseServiceCourseStatus.Active,
  })
  status!: LarvaCourseServiceCourseStatus;

  @Prop({ type: SchemaTypes.UUID, required: true })
  tenantId: string;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;
}

export type LessonDocument = LessonEntity & Document;
export const LessonSchema = SchemaFactory.createForClass(LessonEntity);
