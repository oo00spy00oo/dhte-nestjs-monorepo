import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { LarvaCourseServiceCourseStatus, LarvaCourseServiceLanguage } from '../types';

@InputType({ description: 'Create Sentence Word' })
export class LarvaCourseServiceSentenceTranslationGqlInput {
  @Field(() => LarvaCourseServiceLanguage, { description: 'Language' })
  @IsEnum(LarvaCourseServiceLanguage)
  @IsNotEmpty()
  language!: LarvaCourseServiceLanguage;

  @Field(() => String, { description: 'Translation' })
  @IsString()
  @IsNotEmpty()
  translation!: string;
}

@InputType({ description: 'Create Sentence' })
export class LarvaCourseServiceCreateSentenceGqlInput {
  @Field(() => String, { description: 'Sentence Content' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @Field(() => String, { description: 'Pronunciation Text' })
  @IsString()
  @IsNotEmpty()
  pronunciationText!: string;

  @IsOptional()
  @IsEnum(LarvaCourseServiceCourseStatus)
  @Field(() => LarvaCourseServiceCourseStatus, {
    defaultValue: LarvaCourseServiceCourseStatus.Active,
  })
  status!: LarvaCourseServiceCourseStatus;

  @Field(() => [LarvaCourseServiceSentenceTranslationGqlInput], { description: 'Translations' })
  @IsArray()
  @IsNotEmpty()
  translations!: LarvaCourseServiceSentenceTranslationGqlInput[];
}

@InputType({ description: 'Search Sentence' })
export class LarvaCourseServiceSearchSentenceGqlInput {
  @IsOptional()
  @Field(() => String, { description: 'Sentence Content', nullable: true })
  @IsString()
  content?: string;
}

@InputType()
export class LarvaCourseSentenceVideoGqlInput {
  @Field(() => String)
  url!: string;

  @Field(() => String, { nullable: true })
  caption?: string;
}

@InputType()
export class LarvaCourseWordOfSentencesGqlInput {
  @Field(() => Number)
  position!: number;

  @Field(() => String)
  word!: string;

  @Field(() => String)
  pronunciation!: string;

  @Field(() => String, { nullable: true })
  audioUrl?: string;
}

@InputType({ description: 'Update Sentence' })
export class LarvaCourseServiceUpdateSentenceGqlInput {
  @IsOptional()
  @IsString()
  @Field(() => String, { description: 'Sentence Content', nullable: true })
  content?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { description: 'Pronunciation Text', nullable: true })
  pronunciationText?: string;

  @Field(() => [LarvaCourseServiceSentenceTranslationGqlInput], {
    description: 'Translations',
    nullable: true,
  })
  @IsArray()
  @IsOptional()
  translations?: LarvaCourseServiceSentenceTranslationGqlInput[];

  @IsOptional()
  @IsEnum(LarvaCourseServiceCourseStatus)
  @Field(() => LarvaCourseServiceCourseStatus, { nullable: true })
  status?: LarvaCourseServiceCourseStatus;

  @IsArray()
  @IsOptional()
  @Field(() => [LarvaCourseSentenceVideoGqlInput], { nullable: true })
  videos?: LarvaCourseSentenceVideoGqlInput[];

  @IsArray()
  @IsOptional()
  @Field(() => [LarvaCourseWordOfSentencesGqlInput], { nullable: true })
  words?: LarvaCourseWordOfSentencesGqlInput[];
}

export class LarvaCourseServiceCrawlSentenceKafkaInput {
  @IsNotEmpty()
  @IsString()
  requestId!: string;

  @IsString()
  @IsNotEmpty()
  sentenceId!: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsNotEmpty()
  @IsDateString()
  timestamp!: string;
}
