import { Schema as NestSchema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { Document, SchemaTypes } from 'mongoose';

import { LarvaCourseServiceCourseStatus } from '../../../../core/types';

export type SentenceTranslationDocument = SentenceTranslationEntity & Document;

@NestSchema({
  collection: 'sentence_translations',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class SentenceTranslationEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  sentenceId: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  tenantId: string;

  @Prop({ type: String, required: true })
  language: string;

  @Prop({ type: String, required: true })
  translation: string;

  @Prop({
    type: String,
    enum: LarvaCourseServiceCourseStatus,
    default: LarvaCourseServiceCourseStatus.Active,
  })
  status!: LarvaCourseServiceCourseStatus;

  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  deletedAt?: Date;
}

export const SentenceTranslationSchema = SchemaFactory.createForClass(SentenceTranslationEntity);
