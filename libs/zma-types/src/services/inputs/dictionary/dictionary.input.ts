import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { LanguageEnum } from '../../../enums';
import { DictionaryServiceDictionaryStatus } from '../../../types';

registerEnumType(LanguageEnum, {
  name: 'LanguageEnum',
});

@InputType({ description: 'Dictionary' })
export class DictionaryServiceCreateDictionaryGqlInput {
  @Field(() => String)
  @IsNotEmpty()
  word!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  etymology?: string;

  @Field(() => [DictionaryImageInput], { nullable: true })
  @IsOptional()
  @IsArray()
  images?: DictionaryImageInput[];

  @Field(() => [DictionaryPronunciationInput])
  @IsNotEmpty()
  @IsArray()
  pronunciations!: DictionaryPronunciationInput[];

  @Field(() => String)
  @IsNotEmpty()
  partOfSpeech!: string;

  @Field(() => [DictionarySenseInput], { nullable: true })
  @IsOptional()
  @IsArray()
  senses?: DictionarySenseInput[];

  @Field(() => [DictionaryInflectionInput], { nullable: true })
  @IsOptional()
  @IsArray()
  inflections?: DictionaryInflectionInput[];

  @Field(() => [DictionaryPhraseInput], { nullable: true })
  @IsOptional()
  @IsArray()
  phrases?: DictionaryPhraseInput[];

  @IsOptional()
  @IsEnum(DictionaryServiceDictionaryStatus)
  @Field(() => DictionaryServiceDictionaryStatus, {
    defaultValue: DictionaryServiceDictionaryStatus.Active,
  })
  status!: DictionaryServiceDictionaryStatus;

  @IsOptional()
  @Field(() => [DictionaryWordTranslationInput], { nullable: true })
  wordTranslations?: DictionaryWordTranslationInput[];
}

@InputType()
class DictionaryImageInput {
  @Field(() => String)
  url!: string;

  @Field(() => String, { nullable: true })
  caption?: string;
}

@InputType()
class DictionaryVideoInput {
  @Field(() => String)
  url!: string;

  @Field(() => String, { nullable: true })
  caption?: string;
}

@InputType()
class DictionaryPronunciationInput {
  @Field(() => String, { nullable: true })
  phoneticSpelling?: string;

  @Field(() => String, { nullable: true })
  simplePhonetic?: string;

  @Field(() => String, { nullable: true })
  audioUrl?: string;

  @Field(() => String)
  dialect!: string;

  @Field(() => String, { nullable: true })
  region?: string;

  @Field(() => String, { nullable: true })
  audioKey?: string;

  @Field(() => String, { nullable: true })
  notes?: string;
}

@InputType()
export class LanguageDefinitionInput {
  @Field(() => String)
  definition!: string;

  @IsEnum(() => LanguageEnum)
  @Field(() => LanguageEnum)
  lang!: LanguageEnum;
}

@InputType()
export class DictionaryDefinitionInput {
  @Field(() => [LanguageDefinitionInput])
  languageDefinitions!: LanguageDefinitionInput[];
}

@InputType()
class DictionarySenseInput {
  @Field(() => Number)
  senseNumber!: number;

  @Field(() => [DictionaryDefinitionInput])
  definitions!: DictionaryDefinitionInput[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  grammar?: string[];

  @Field(() => [String], { nullable: true })
  labels?: string[];

  @Field(() => [String], { nullable: true })
  domain?: string[];

  @Field(() => [String], { nullable: true })
  regions?: string[];

  @IsOptional()
  @Field(() => [DictionaryExampleInput], { nullable: true })
  examples?: DictionaryExampleInput[];

  @IsOptional()
  @Field(() => [DictionaryQuotationInput], { nullable: true })
  quotations?: DictionaryQuotationInput[];

  @IsOptional()
  @Field(() => [DictionaryCrossReferenceInput], { nullable: true })
  crossReferences?: DictionaryCrossReferenceInput[];

  @Field(() => String, { nullable: true })
  notes?: string;
}

@InputType()
class DictionaryExampleInput {
  @Field(() => String)
  text!: string;
}

@InputType()
class DictionaryQuotationInput {
  @Field(() => String)
  text!: string;

  @Field(() => String, { nullable: true })
  source?: string;

  @Field(() => String, { nullable: true })
  author?: string;

  @Field(() => String, { nullable: true })
  date?: string;

  @Field(() => String, { nullable: true })
  publication?: string;
}

@InputType()
class DictionaryCrossReferenceWordInput {
  @Field(() => String)
  word!: string;

  @Field(() => String, { nullable: true })
  partOfSpeech?: string;
}

@InputType()
class DictionaryCrossReferenceInput {
  @Field(() => [DictionaryCrossReferenceWordInput])
  words!: DictionaryCrossReferenceWordInput[];

  @Field(() => String)
  type!: string;

  @Field(() => String, { nullable: true })
  notes?: string;
}

@InputType()
class DictionaryInflectionInput {
  @Field(() => String)
  form!: string;

  @Field(() => String)
  type!: string;

  @Field(() => String, { nullable: true })
  pronunciations!: string;
}

@InputType()
class DictionaryPhraseInput {
  @Field(() => String)
  phrase!: string;

  @Field(() => String)
  definition!: string;

  @IsOptional()
  @Field(() => [DictionaryExampleInput], { nullable: true })
  examples?: DictionaryExampleInput[];
}

@InputType()
export class DictionaryWordTranslationInput {
  @IsEnum(() => LanguageEnum)
  @Field(() => LanguageEnum)
  lang!: LanguageEnum;

  @Field(() => String)
  translation!: string;
}

@InputType()
export class DictionaryServiceUpdateDictionaryGqlInput {
  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  hasImage?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  hasAudio?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  etymology?: string;

  @Field(() => [DictionaryImageInput], { nullable: true })
  @IsOptional()
  @IsArray()
  images?: DictionaryImageInput[];

  @Field(() => [DictionaryVideoInput], { nullable: true })
  @IsOptional()
  @IsArray()
  videos?: DictionaryVideoInput[];

  @Field(() => [DictionaryPronunciationInput], { nullable: true })
  @IsOptional()
  @IsArray()
  pronunciations?: DictionaryPronunciationInput[];

  @Field(() => [DictionarySenseInput], { nullable: true })
  @IsOptional()
  @IsArray()
  senses?: DictionarySenseInput[];

  @Field(() => [DictionaryInflectionInput], { nullable: true })
  @IsOptional()
  @IsArray()
  inflections?: DictionaryInflectionInput[];

  @Field(() => [DictionaryPhraseInput], { nullable: true })
  @IsOptional()
  @IsArray()
  phrases?: DictionaryPhraseInput[];

  @IsOptional()
  @IsEnum(DictionaryServiceDictionaryStatus)
  @Field(() => DictionaryServiceDictionaryStatus, {
    defaultValue: DictionaryServiceDictionaryStatus.Active,
  })
  status?: DictionaryServiceDictionaryStatus;

  @IsOptional()
  @Field(() => [DictionaryWordTranslationInput], { nullable: true })
  wordTranslations?: DictionaryWordTranslationInput[];
}

@InputType()
export class DictionaryServiceGetDictionaryInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  id!: string;
}

@InputType()
export class DictionaryServiceGetDictionariesInput {
  @IsArray()
  @IsNotEmpty({ each: true })
  @Field(() => [String], { defaultValue: [] })
  ids!: string[];
}

@InputType()
export class DictionaryServiceSearchDictionariesInput {
  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  word?: string;
}

@InputType()
export class DictionaryServiceSearchByWordAndPosInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  word!: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  partOfSpeech!: string;
}
@InputType()
export class DictionaryServiceSearchManyByWordAndPosInput {
  @IsArray()
  @IsNotEmpty()
  @Field(() => [DictionaryServiceSearchByWordAndPosInput])
  wordAndPosInputs!: DictionaryServiceSearchByWordAndPosInput[];
}

export class DictionaryServiceCrawlWordsForLessonKafkaInput {
  @IsNotEmpty()
  @IsString()
  requestId!: string;

  @IsArray()
  @IsNotEmpty({ each: true })
  words!: DictionaryServiceSearchByWordAndPosInput[];

  @IsNotEmpty()
  @IsDateString()
  timestamp!: string;
}
