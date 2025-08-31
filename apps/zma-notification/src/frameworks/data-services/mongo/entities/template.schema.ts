import { Schema as NestSchema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { LanguageEnum, NotificationServiceChannel } from '@zma-nestjs-monorepo/zma-types';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { SchemaTypes } from 'mongoose';

@NestSchema({
  collection: 'templates',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class TemplateEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  tenantId: string;

  @Prop({ type: SchemaTypes.String, required: true })
  code: string;

  @Prop({ type: SchemaTypes.String, enum: NotificationServiceChannel, required: true })
  channel: NotificationServiceChannel;

  @Prop({ type: SchemaTypes.String, enum: LanguageEnum, required: true })
  language: LanguageEnum;

  @Prop({ type: SchemaTypes.String, required: true })
  content: string;

  @Prop({ type: SchemaTypes.String })
  subject?: string;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: SchemaTypes.Date })
  deletedAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;
}

export type TemplateDocument = TemplateEntity & Document;

export const TemplateSchema = SchemaFactory.createForClass(TemplateEntity);
