import { Schema as NestSchema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { SchemaTypes } from 'mongoose';

@NestSchema({
  collection: 'in_app_notifications',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class InAppNotificationEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  tenantId: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  userId: string;

  @Prop({ type: SchemaTypes.String, required: true })
  title: string;

  @Prop({ type: SchemaTypes.String, required: true })
  content: string;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  isRead?: boolean;

  @Prop({ type: SchemaTypes.Date })
  readAt?: Date;

  @Prop({ type: SchemaTypes.Mixed })
  metadata?: Record<string, unknown>;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: SchemaTypes.Date })
  deletedAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;
}

export type InAppNotificationDocument = InAppNotificationEntity & Document;

export const InAppNotificationSchema = SchemaFactory.createForClass(InAppNotificationEntity);
