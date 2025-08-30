import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsString, IsOptional } from 'class-validator';

@InputType()
export class WordInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  partOfSpeech!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  word!: string;

  @IsNotEmpty()
  @Field(() => String)
  @IsString()
  lessonSpeakingId!: string;
}

@InputType()
export class SentenceInput {
  @IsNotEmpty()
  @Field(() => String)
  @IsString()
  sentenceId!: string;

  @IsNotEmpty()
  @Field(() => String)
  @IsString()
  lessonSpeakingId!: string;
}

@InputType()
export class LarvaCourseServiceCreateUserCollectionGqlInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @Field(() => [WordInput], { nullable: true })
  @IsArray()
  words?: WordInput[];

  @IsOptional()
  @Field(() => [SentenceInput], { nullable: true })
  @IsArray()
  sentences?: SentenceInput[];
}

@InputType()
export class LarvaCourseServiceUpdateUserCollectionGqlInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @Field(() => [WordInput], { nullable: true })
  @IsArray()
  words?: WordInput[];

  @IsOptional()
  @Field(() => [String], { nullable: true })
  @IsArray()
  sentences?: string[];
}

@InputType({ description: 'Search Collection of User' })
export class LarvaCourseServiceSearchCollectionOfUserGqlInput {
  @IsOptional()
  @Field(() => String, { description: 'Name', nullable: true })
  @IsString()
  name?: string;
}

@InputType()
export class LarvaCourseServiceChangeItemsOfCollectionGqlInput {
  @IsOptional()
  @Field(() => [WordInput], { nullable: true })
  @IsArray()
  words?: WordInput[];

  @IsOptional()
  @Field(() => [SentenceInput], { nullable: true })
  @IsArray()
  sentences?: SentenceInput[];
}

@InputType()
export class LarvaCourseServiceChangeNameCollectionGqlInput {
  @IsNotEmpty()
  @Field(() => String)
  @IsString()
  name!: string;
}
