import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsArray, IsEnum, IsNumber, Min } from 'class-validator';
import { Max } from 'class-validator';

import { LarvaCourseServiceCefrLevel, LarvaCourseServiceCourseStatus } from '../types';

@InputType({ description: 'Word Input' })
class LessonWordInput {
  @Field(() => String, { description: 'Part of Speech' })
  @IsString()
  @IsNotEmpty()
  partOfSpeech!: string;

  @Field(() => String, { description: 'Word' })
  @IsString()
  @IsNotEmpty()
  word!: string;
}

@InputType({ description: 'Lesson' })
export class LarvaCourseServiceCreateLessonGqlInput {
  @IsNotEmpty()
  @Field(() => String)
  @IsString()
  name!: string;

  @IsNotEmpty()
  @Field(() => Number)
  @IsNumber()
  order!: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  description?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  image?: string;

  @IsNotEmpty()
  @Field(() => LarvaCourseServiceCefrLevel)
  @IsEnum(LarvaCourseServiceCefrLevel)
  level!: LarvaCourseServiceCefrLevel;

  @IsNotEmpty()
  @Field(() => String)
  @IsString()
  topicId!: string;

  @IsOptional()
  @Field(() => [String], { description: 'Array of sentence IDs', nullable: true })
  @IsArray()
  @IsString({ each: true })
  sentences?: string[];

  @IsOptional()
  @Field(() => [LessonWordInput], { description: 'Words', nullable: true })
  @IsArray()
  words?: LessonWordInput[];
}

@InputType({ description: 'Lesson' })
export class LarvaCourseServiceUpdateLessonGqlInput {
  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  name?: string;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  @IsNumber()
  order?: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  description?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  image?: string;

  @IsNotEmpty()
  @Field(() => LarvaCourseServiceCefrLevel)
  @IsEnum(LarvaCourseServiceCefrLevel)
  level!: LarvaCourseServiceCefrLevel;

  @IsOptional()
  @Field(() => [String], { description: 'Array of sentence IDs', nullable: true })
  @IsArray()
  @IsString({ each: true })
  sentences?: string[];

  @IsOptional()
  @Field(() => [LessonWordInput], { description: 'Words', nullable: true })
  @IsArray()
  words?: LessonWordInput[];

  @IsOptional()
  @IsEnum(LarvaCourseServiceCourseStatus)
  @Field(() => LarvaCourseServiceCourseStatus, { nullable: true })
  status?: LarvaCourseServiceCourseStatus;
}

@InputType({ description: 'Lesson' })
export class LarvaCourseServiceSearchLessonGqlInput {
  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  name?: string;

  @IsOptional()
  @Field(() => LarvaCourseServiceCefrLevel, { nullable: true })
  @IsEnum(LarvaCourseServiceCefrLevel)
  level?: LarvaCourseServiceCefrLevel;

  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  topicId!: string;

  // @IsOptional()
  // @Field(() => String, { nullable: true })
  // @IsString()
  // skillCode?: string;

  // @IsOptional()
  // @Field(() => String, { nullable: true })
  // @IsString()
  // categoryCode?: string;
}

@InputType({ description: 'Get Nearly Lessons' })
export class LarvaCourseServiceGetNearlyLessonsGqlInput {
  @IsNotEmpty()
  @Field(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  total!: number;
}

@InputType({ description: 'Lesson word' })
export class LarvaCourseServiceSearchLessonWordGqlInput {
  @IsNotEmpty()
  @Field(() => String)
  @IsString()
  word!: string;
}

@InputType({ description: 'Lesson sentence' })
export class LarvaCourseServiceSearchLessonSentenceGqlInput {
  @IsNotEmpty()
  @Field(() => String)
  @IsString()
  content!: string;
}
