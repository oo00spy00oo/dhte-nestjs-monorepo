import { Field, ObjectType } from '@nestjs/graphql';

import { LessonWordGqlOutput, LarvaCourseServiceSentenceGqlOutput } from '../outputs';

@ObjectType()
class LarvaCourseServiceFavoriteWordGqlOutput {
  @Field(() => String)
  partOfSpeech!: string;

  @Field(() => String)
  word!: string;

  @Field(() => String)
  lessonSpeakingId!: string;
}

@ObjectType()
class LarvaCourseServiceFavoriteSentenceGqlOutput {
  @Field(() => String)
  sentenceId!: string;

  @Field(() => String)
  lessonSpeakingId!: string;
}

@ObjectType()
export class LarvaCourseServiceGeneralUserCollectionGqlOutput {
  @Field(() => String)
  id?: string;

  @Field(() => String)
  userId!: string;

  @Field(() => String)
  name!: string;

  @Field(() => [LarvaCourseServiceFavoriteWordGqlOutput], { nullable: true })
  words?: LarvaCourseServiceFavoriteWordGqlOutput[];

  @Field(() => [LarvaCourseServiceFavoriteSentenceGqlOutput], { nullable: true })
  sentences?: LarvaCourseServiceFavoriteSentenceGqlOutput[];

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class LarvaCourseServiceWordOfCollectionGqlOutput extends LessonWordGqlOutput {
  @Field(() => String, { nullable: true })
  lessonSpeakingId?: string;
}

@ObjectType()
export class LarvaCourseServiceSentenceOfCollectionGqlOutput extends LarvaCourseServiceSentenceGqlOutput {
  @Field(() => String, { nullable: true })
  lessonSpeakingId?: string;
}

@ObjectType()
export class LarvaCourseServiceDetailUserCollectionGqlOutput {
  @Field(() => String)
  id?: string;

  @Field(() => String)
  userId!: string;

  @Field(() => String)
  name!: string;

  @Field(() => [LarvaCourseServiceWordOfCollectionGqlOutput], { nullable: true })
  words?: LarvaCourseServiceWordOfCollectionGqlOutput[];

  @Field(() => [LarvaCourseServiceSentenceOfCollectionGqlOutput], { nullable: true })
  sentences?: LarvaCourseServiceSentenceOfCollectionGqlOutput[];

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

export class LarvaCourseServiceUserCollectionOutput extends LarvaCourseServiceGeneralUserCollectionGqlOutput {}
