import { Schema as NestSchema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { Document, SchemaTypes } from 'mongoose';

export type HistoryDocument = HistoryEntity & Document;

@NestSchema({
  collection: 'histories',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class HistoryEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  userId: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  tenantId: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  lessonId: string;

  @Prop({ type: String, required: true })
  subjectCode: string;

  @Prop({ type: String, required: true })
  skillCode: string;

  @Prop({ type: String, required: true })
  categoryCode: string;

  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;
}

export const HistorySchema = SchemaFactory.createForClass(HistoryEntity);
