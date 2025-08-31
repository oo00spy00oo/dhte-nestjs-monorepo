import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { Document, SchemaTypes } from 'mongoose';

import { ZaloOaEntity } from './zalo-oa.schema';

export type ZaloZnsTemplateDocument = ZaloZnsTemplateEntity & Document;

@NestSchema({
  collection: 'zalo_zns_templates',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class ZaloZnsTemplateEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  tenantId: string;

  @Prop({ type: SchemaTypes.UUID, required: true, ref: ZaloOaEntity.name })
  oaId: string;

  @Prop({ type: SchemaTypes.String, required: true })
  zaloTemplateId: string;

  @Prop({ type: SchemaTypes.String, required: true })
  templateName: string;

  @Prop({ type: SchemaTypes.String, default: '' })
  description?: string;

  @Prop({ type: [SchemaTypes.String], required: true })
  requiredParams: string[];

  @Prop({ type: SchemaTypes.Boolean, default: true })
  isActive?: boolean;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;
}

export const ZaloZnsTemplateSchema = SchemaFactory.createForClass(ZaloZnsTemplateEntity);
ZaloZnsTemplateSchema.index({ oaId: 1, zaloTemplateId: 1 }, { unique: true });
