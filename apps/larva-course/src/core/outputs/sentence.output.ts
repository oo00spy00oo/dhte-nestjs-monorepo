import { Field, ObjectType } from '@nestjs/graphql';
import { FindManyOutput } from '@zma-nestjs-monorepo/zma-types';

import { LarvaCourseServiceCourseStatus, LarvaCourseServiceLanguage } from '../types';

@ObjectType()
export class LarvaCourseServiceSentenceTranslationGqlOutput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => LarvaCourseServiceLanguage, { nullable: true })
  language?: LarvaCourseServiceLanguage;

  @Field(() => String, { nullable: true })
  translation?: string;

  @Field(() => String, { nullable: true })
  sentenceId?: string;

  @Field(() => String, { nullable: true })
  tenantId?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
}

@ObjectType()
export class LarvaCourseServiceSentenceWordOutput {
  @Field(() => Number, { nullable: true })
  position?: number;

  // @Field(() => String)
  // partOfSpeech!: string;

  @Field(() => String, { nullable: true })
  word?: string;

  @Field(() => String, { nullable: true })
  pronunciation?: string;

  @Field(() => String, { nullable: true })
  audioUrl?: string;
}

@ObjectType()
class LarvaCourseSentenceVideoGqlOutput {
  @Field(() => String, { nullable: true })
  url?: string;

  @Field(() => String, { nullable: true })
  caption?: string;
}
@ObjectType()
export class LarvaCourseServiceSentenceGqlOutput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  content?: string;

  @Field(() => String, { nullable: true })
  pronunciationText?: string;

  @Field(() => [LarvaCourseServiceSentenceWordOutput], { nullable: true })
  words?: LarvaCourseServiceSentenceWordOutput[];

  @Field(() => [LarvaCourseSentenceVideoGqlOutput], { nullable: true })
  videos?: LarvaCourseSentenceVideoGqlOutput[];

  @Field(() => LarvaCourseServiceCourseStatus, { nullable: true })
  status?: LarvaCourseServiceCourseStatus;

  @Field(() => [LarvaCourseServiceSentenceTranslationGqlOutput], { nullable: true })
  translations?: LarvaCourseServiceSentenceTranslationGqlOutput[];

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
}

@ObjectType()
export class LarvaCourseServiceSentencesGqlOutput extends FindManyOutput(
  LarvaCourseServiceSentenceGqlOutput,
) {}

export class LarvaCourseServiceSentenceOutput extends LarvaCourseServiceSentenceGqlOutput {}
