import { Schema as NestSchema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { Document, SchemaTypes } from 'mongoose';

import { ZaloZnsTemplateEntity } from './zalo-zns-template.schema';

export type ZaloZnsMessageDocument = ZaloZnsMessageEntity & Document;

export enum ZaloZnsMessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  DELIVERED = 'delivered',
}

@NestSchema({
  collection: 'zalo_zns_messages',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class ZaloZnsMessageEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  tenantId: string;

  @Prop({ type: SchemaTypes.UUID, required: true, ref: ZaloZnsTemplateEntity.name })
  templateId: string;

  @Prop({ type: SchemaTypes.String })
  zaloPhoneNumber?: string;

  @Prop({ type: SchemaTypes.String })
  zaloUid?: string;

  @Prop({ type: SchemaTypes.Mixed, required: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: Record<string, any>;

  @Prop({ type: SchemaTypes.Mixed, default: null })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response?: Record<string, any>;

  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;
}

export const ZaloZnsMessageSchema = SchemaFactory.createForClass(ZaloZnsMessageEntity);
