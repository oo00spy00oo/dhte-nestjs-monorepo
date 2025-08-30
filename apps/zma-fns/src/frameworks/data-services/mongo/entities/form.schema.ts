import { Schema as NestSchema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { Document, SchemaTypes } from 'mongoose';

import { QuestionEntity } from './question.schema';

@NestSchema({
  collection: 'forms',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class FormEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: SchemaTypes.UUID })
  tenantId?: string;

  @Prop({ type: SchemaTypes.String, required: true })
  title: string;

  @Prop({ type: SchemaTypes.String })
  description?: string;

  @Prop({ type: SchemaTypes.Boolean, default: true })
  isActive?: boolean;

  @Prop({ type: SchemaTypes.Boolean, required: true })
  isAnonymous: boolean;

  @Prop({ type: [QuestionEntity], default: [] })
  questions: QuestionEntity[];

  @Prop({ type: SchemaTypes.Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: SchemaTypes.Date })
  deletedAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;
}
export type FormDocument = FormEntity & Document;
export const FormSchema = SchemaFactory.createForClass(FormEntity);
