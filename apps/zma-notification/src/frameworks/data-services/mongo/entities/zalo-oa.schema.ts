import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { Document, SchemaTypes } from 'mongoose';

export type ZaloOaDocument = ZaloOaEntity & Document;

@NestSchema({
  collection: 'zalo_oas',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class ZaloOaEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  tenantId: string;

  @Prop({ type: SchemaTypes.String, required: true, unique: true })
  zaloOaId: string;

  @Prop({ type: SchemaTypes.String, required: true })
  name: string;

  @Prop({ type: SchemaTypes.String })
  description?: string;

  @Prop({ type: SchemaTypes.Boolean, default: true })
  isActive?: boolean;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;
}

export const ZaloOaSchema = SchemaFactory.createForClass(ZaloOaEntity);
