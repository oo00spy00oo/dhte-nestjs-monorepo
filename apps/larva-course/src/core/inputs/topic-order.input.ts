import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

import { LarvaCourseServiceCourseStatus } from '../types';

@InputType({ description: 'Topic Order' })
export class LarvaCourseServiceCreateTopicOrderGqlInput {
  @IsNotEmpty()
  @Field(() => String)
  @IsString()
  categoryCode!: string;

  @IsNotEmpty()
  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  topicIds!: string[];

  // @IsNotEmpty()
  // @Field(() => String)
  // @IsString()
  // subjectCode!: string;

  // @IsNotEmpty()
  // @Field(() => String)
  // @IsString()
  // skillCode!: string;

  @IsOptional()
  @Field(() => LarvaCourseServiceCourseStatus, { nullable: true })
  @IsEnum(LarvaCourseServiceCourseStatus)
  status?: LarvaCourseServiceCourseStatus;
}

@InputType({ description: 'Topic Order' })
export class LarvaCourseServiceUpdateTopicOrderGqlInput {
  @IsOptional()
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  topicIds?: string[];

  @IsOptional()
  @Field(() => LarvaCourseServiceCourseStatus, { nullable: true })
  @IsEnum(LarvaCourseServiceCourseStatus)
  status?: LarvaCourseServiceCourseStatus;
}

@InputType({ description: 'Topic Order' })
export class LarvaCourseServiceSearchTopicOrderGqlInput {
  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  categoryCode?: string;
}
