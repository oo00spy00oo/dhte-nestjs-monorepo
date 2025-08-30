import { Field, ObjectType } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';

import { LanguageEnum } from '../../../enums';
import { DictionaryServiceDictionaryStatus } from '../../../types';

@ObjectType()
class DictionaryImage {
  @Field(() => String, { nullable: true })
  url?: string;

  @Field(() => String, { nullable: true })
  caption?: string;
}
@ObjectType()
class DictionaryVideo {
  @Field(() => String, { nullable: true })
  url?: string;

  @Field(() => String, { nullable: true })
  caption?: string;
}

@ObjectType()
class DictionaryExample {
  @Field(() => String, { nullable: true })
  text?: string;
}

@ObjectType()
class DictionaryPronunciation {
  @Field(() => String, { nullable: true })
  phoneticSpelling?: string;

  @Field(() => String, { nullable: true })
  simplePhonetic?: string;

  @Field(() => String, { nullable: true })
  audioUrl?: string;

  @Field(() => String, { nullable: true })
  dialect?: string;

  @Field(() => String, { nullable: true })
  region?: string;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => String, { nullable: true })
  audioKey?: string;
}

@ObjectType()
class DictionaryQuotation {
  @Field(() => String, { nullable: true })
  text?: string;

  @Field(() => String, { nullable: true })
  source?: string;

  @Field(() => String, { nullable: true })
  author?: string;

  @Field(() => String, { nullable: true })
  date?: string;

  @Field(() => String, { nullable: true })
  publication?: string;
}

@ObjectType()
class DictionaryCrossReferenceWordOutput {
  @Field(() => String)
  word!: string;

  @Field(() => String, { nullable: true })
  partOfSpeech?: string;
}

@ObjectType()
class DictionaryCrossReference {
  @Field(() => [DictionaryCrossReferenceWordOutput])
  words!: DictionaryCrossReferenceWordOutput[];

  @Field(() => String)
  type!: string;

  @Field(() => String, { nullable: true })
  notes?: string;
}

@ObjectType()
class DictionaryInflection {
  @Field(() => String, { nullable: true })
  form?: string;

  @Field(() => String, { nullable: true })
  type?: string;

  @Field(() => String, { nullable: true })
  pronunciations?: string;
}

@ObjectType()
class DictionaryPhrase {
  @Field(() => String, { nullable: true })
  phrase?: string;

  @Field(() => String, { nullable: true })
  definition?: string;

  @Field(() => [DictionaryExample], { nullable: true })
  examples?: DictionaryExample[];
}

@ObjectType()
export class LanguageDefinitionOutput {
  @Field(() => String)
  definition!: string;

  @IsEnum(() => LanguageEnum)
  @Field(() => LanguageEnum)
  lang!: LanguageEnum;
}

@ObjectType()
export class DictionaryDefinitionOutput {
  @Field(() => [LanguageDefinitionOutput])
  languageDefinitions!: LanguageDefinitionOutput[];
}

@ObjectType()
class DictionarySense {
  @Field(() => Number)
  senseNumber!: number;

  @Field(() => [DictionaryDefinitionOutput], { nullable: true })
  definitions?: DictionaryDefinitionOutput[];

  @Field(() => [String], { nullable: true })
  grammar?: string[];

  @Field(() => [String], { nullable: true })
  labels?: string[];

  @Field(() => [String], { nullable: true })
  domain?: string[];

  @Field(() => [String], { nullable: true })
  regions?: string[];

  @Field(() => [DictionaryExample], { nullable: true })
  examples?: DictionaryExample[];

  @Field(() => [DictionaryQuotation], { nullable: true })
  quotations?: DictionaryQuotation[];

  @Field(() => [DictionaryCrossReference], { nullable: true })
  crossReferences?: DictionaryCrossReference[];

  @Field(() => String, { nullable: true })
  notes?: string;
}

@ObjectType()
class DictionaryWordTranslationOutput {
  @IsEnum(() => LanguageEnum)
  @Field(() => LanguageEnum, { nullable: true })
  lang?: LanguageEnum;

  @Field(() => String, { nullable: true })
  translation?: string;
}

@ObjectType({ description: 'Dictionary' })
export class DictionaryServiceDictionaryGqlOutput {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  word!: string;

  @Field(() => String, { nullable: true })
  etymology?: string;

  @Field(() => [DictionaryImage], { nullable: true })
  images?: DictionaryImage[];

  @Field(() => [DictionaryVideo], { nullable: true })
  videos?: DictionaryVideo[];

  @Field(() => [DictionaryPronunciation], { nullable: true })
  pronunciations?: DictionaryPronunciation[];

  @Field(() => String)
  partOfSpeech!: string;

  @Field(() => [DictionarySense], { nullable: true })
  senses?: DictionarySense[];

  @Field(() => [DictionaryInflection], { nullable: true })
  inflections?: DictionaryInflection[];

  @Field(() => [DictionaryPhrase], { nullable: true })
  phrases?: DictionaryPhrase[];

  @Field(() => DictionaryServiceDictionaryStatus)
  status!: DictionaryServiceDictionaryStatus;

  @Field(() => Boolean, { nullable: true })
  hasAudio?: boolean;

  @Field(() => Boolean, { nullable: true })
  hasImage?: boolean;

  @Field(() => [DictionaryWordTranslationOutput], { nullable: true })
  wordTranslations?: DictionaryWordTranslationOutput[];

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

export class DictionaryServiceDictionaryOutput extends DictionaryServiceDictionaryGqlOutput {}
