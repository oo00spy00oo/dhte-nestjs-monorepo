import { Schema as NestSchema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { Document, SchemaTypes } from 'mongoose';

export type UserCollectionDocument = UserCollectionEntity & Document;

@NestSchema({
  collection: 'user-collections',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class UserCollectionEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  userId: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  tenantId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({
    type: [
      {
        word: { type: String, required: true },
        partOfSpeech: { type: String, required: true },
        lessonSpeakingId: { type: SchemaTypes.UUID, required: true },
        _id: false,
      },
    ],
  })
  words?: {
    word: string;
    partOfSpeech: string;
    lessonSpeakingId: string;
  }[];

  @Prop({
    type: [
      {
        sentenceId: { type: SchemaTypes.UUID, required: true },
        lessonSpeakingId: { type: SchemaTypes.UUID, required: true },
        _id: false,
      },
    ],
  })
  sentences?: {
    sentenceId: string;
    lessonSpeakingId: string;
  }[];

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: SchemaTypes.Date })
  deletedAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;
}

export const UserCollectionSchema = SchemaFactory.createForClass(UserCollectionEntity);
