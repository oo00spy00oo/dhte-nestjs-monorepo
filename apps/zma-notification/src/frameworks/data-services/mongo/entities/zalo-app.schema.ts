import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { Document, SchemaTypes } from 'mongoose';

export type ZaloAppDocument = ZaloAppEntity & Document;

@NestSchema({
  collection: 'zalo_apps',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class ZaloAppEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  tenantId: string;

  @Prop({ type: SchemaTypes.String, required: true })
  zaloOaId: string;

  @Prop({ type: SchemaTypes.String, required: true })
  zaloOaSecretKey: string;

  @Prop({ type: SchemaTypes.String, required: true })
  zaloAppId: string;

  @Prop({ type: SchemaTypes.String, required: true })
  zaloAppSecretKey: string;

  @Prop({ type: SchemaTypes.String, required: true })
  name: string;

  @Prop({ type: SchemaTypes.String })
  description?: string;

  @Prop({ type: SchemaTypes.String })
  accessToken?: string; // should be encrypted

  @Prop({ type: SchemaTypes.String })
  refreshToken?: string; // should be encrypted

  @Prop({ type: SchemaTypes.Date })
  tokenExpiresAt?: Date;

  @Prop({ type: SchemaTypes.Boolean, default: true })
  isActive?: boolean;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;
}

export const ZaloAppSchema = SchemaFactory.createForClass(ZaloAppEntity);
