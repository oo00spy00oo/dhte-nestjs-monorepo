import { Schema as NestSchema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { Document, SchemaTypes } from 'mongoose';

import { LarvaCourseServiceCourseStatus } from '../../../../core/types';

export type TopicOrderDocument = TopicOrderEntity & Document;

@NestSchema({
  collection: 'topic_orders',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class TopicOrderEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: String, required: true, unique: true })
  categoryCode: string;

  @Prop({ type: [SchemaTypes.UUID], required: true, default: [] })
  topicIds: string[];

  // @Prop({ type: String, required: true })
  // subjectCode: string;

  // @Prop({ type: String, required: true })
  // skillCode: string;

  @Prop({
    type: String,
    enum: LarvaCourseServiceCourseStatus,
    default: LarvaCourseServiceCourseStatus.Active,
  })
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

export const TopicOrderSchema = SchemaFactory.createForClass(TopicOrderEntity);
