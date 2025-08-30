import { Schema as NestSchema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { Document, SchemaTypes } from 'mongoose';

@NestSchema({ _id: false })
export class AnswerEntity {
  @Prop({ type: SchemaTypes.String, required: true })
  questionId: string;

  @Prop({ type: [SchemaTypes.String], required: true })
  answer: string[];
}

@NestSchema({
  collection: 'user-responses',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class UserResponseEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: SchemaTypes.UUID })
  tenantId?: string;

  @Prop({ type: SchemaTypes.UUID })
  surveyId?: string;

  @Prop({ type: SchemaTypes.UUID })
  formId?: string;

  @Prop({ type: SchemaTypes.UUID })
  userId?: string;

  @Prop({ type: SchemaTypes.String })
  ipAddress?: string;

  @Prop({ type: SchemaTypes.String })
  userAgent?: string;

  @Prop({ type: [AnswerEntity], required: true })
  answers: AnswerEntity[];

  @Prop({ type: SchemaTypes.Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: SchemaTypes.Date })
  deletedAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;
}

export type UserResponseDocument = UserResponseEntity & Document;
export const UserResponseSchema = SchemaFactory.createForClass(UserResponseEntity);
