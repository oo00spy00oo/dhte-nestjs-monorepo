import { Schema as NestSchema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { DictionaryServiceDictionaryStatus } from '@zma-nestjs-monorepo/zma-types';
import { LanguageEnum } from '@zma-nestjs-monorepo/zma-types';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import mongoose, { Document, SchemaTypes } from 'mongoose';

export class DictionaryDefinitionEntity {
  languageDefinitions: {
    definition: string;
    lang: LanguageEnum;
  }[];
}

export class DictionarySenseEntity {
  senseNumber: number;
  definitions: DictionaryDefinitionEntity[];
  grammar?: string[];
  // synonyms?: string[];
  // antonyms?: string[];
  labels?: string[];
  domain?: string[];
  regions?: string[];
  examples?: { text: string }[];
  quotations?: {
    text: string;
    source?: string;
    author?: string;
    date?: string;
    publication?: string;
  }[];
  crossReferences?: {
    words: { word: string; partOfSpeech?: string }[];
    type: string;
    notes?: string;
  }[];
  notes?: string;
}

export class DictionaryPronunciationEntity {
  phoneticSpelling?: string;
  simplePhonetic?: string;
  audioUrl?: string;
  dialect: string;
  region?: string;
  audioKey?: string;
  notes?: string;
}

export class DictionaryPhraseEntity {
  phrase: string;
  definition: string;
  examples?: { text: string }[];
}

export class DictionaryInflectionEntity {
  form: string;
  type: string;
  pronunciations: string;
}

export class DictionaryWordTranslationEntity {
  lang: LanguageEnum;
  translation: string;
}

export type DictionaryDocument = DictionaryEntity & Document;

@NestSchema({
  collection: 'dictionary',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class DictionaryEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: String, required: true })
  word!: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  wordTranslations?: DictionaryWordTranslationEntity[];

  @Prop({ type: String })
  etymology?: string; // A detailed description of the word’s origin.

  @Prop({ type: Boolean, default: false })
  hasImage?: boolean;

  @Prop({ type: Boolean, default: false })
  hasAudio?: boolean;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  images?: { url: string; caption?: string }[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  videos?: { url: string; caption?: string }[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  pronunciations?: DictionaryPronunciationEntity[];

  @Prop({ type: String, required: true })
  partOfSpeech!: string;

  @Prop({
    type: mongoose.Schema.Types.Mixed,
  })
  senses?: DictionarySenseEntity[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  inflections?: DictionaryInflectionEntity[];

  @Prop({
    type: mongoose.Schema.Types.Mixed,
  })
  phrases?: DictionaryPhraseEntity[];

  @Prop({
    type: String,
    enum: DictionaryServiceDictionaryStatus,
  })
  status!: DictionaryServiceDictionaryStatus;

  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;
}

export const DictionarySchema = SchemaFactory.createForClass(DictionaryEntity);
