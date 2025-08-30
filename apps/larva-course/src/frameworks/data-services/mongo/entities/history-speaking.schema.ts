import { Schema as NestSchema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { Document, SchemaTypes } from 'mongoose';

@NestSchema({
  collection: 'history_speakings',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class HistorySpeakingEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  historyId: string;

  @Prop({ type: SchemaTypes.UUID })
  analyzeId?: string;

  @Prop({ type: Number, default: 0 })
  mark?: number;

  @Prop({ type: String })
  record?: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  tenantId: string;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;
}

export type HistorySpeakingDocument = HistorySpeakingEntity & Document;
export const HistorySpeakingSchema = SchemaFactory.createForClass(HistorySpeakingEntity);
