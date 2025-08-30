import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

import { LarvaCourseServiceCourseStatus } from '../types';

@InputType({ description: 'Lesson Order' })
export class LarvaCourseServiceCreateLessonOrderGqlInput {
  @IsNotEmpty()
  @Field(() => String)
  @IsString()
  topicId!: string;

  @IsNotEmpty()
  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  lessonIds!: string[];

  @IsOptional()
  @Field(() => LarvaCourseServiceCourseStatus, { nullable: true })
  @IsEnum(LarvaCourseServiceCourseStatus)
  status?: LarvaCourseServiceCourseStatus;
}

@InputType({ description: 'Lesson Order' })
export class LarvaCourseServiceUpdateLessonOrderGqlInput {
  @IsOptional()
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  lessonIds?: string[];

  @IsOptional()
  @Field(() => LarvaCourseServiceCourseStatus, { nullable: true })
  @IsEnum(LarvaCourseServiceCourseStatus)
  status?: LarvaCourseServiceCourseStatus;
}

@InputType({ description: 'Lesson Order' })
export class LarvaCourseServiceSearchLessonOrderGqlInput {
  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  topicId?: string;
}
