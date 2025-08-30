import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { LarvaCourseServiceCefrLevel, LarvaCourseServiceCourseStatus } from '../types';

@InputType({ description: 'Topic' })
export class LarvaCourseServiceCreateTopicGqlInput {
  @IsNotEmpty()
  @Field(() => String)
  @IsString()
  name!: string;

  @IsNotEmpty()
  @Field(() => Number)
  @IsNumber()
  order!: number;

  @IsNotEmpty()
  @Field(() => String)
  @IsString()
  description!: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  image?: string;

  // @IsNotEmpty()
  // @Field(() => LarvaCourseServiceCefrLevel)
  // @IsEnum(LarvaCourseServiceCefrLevel)
  // level!: LarvaCourseServiceCefrLevel;

  @IsNotEmpty()
  @Field(() => String)
  @IsString()
  @IsString()
  categoryCode!: string;
}

@InputType({ description: 'Topic' })
export class LarvaCourseServiceUpdateTopicGqlInput {
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

  // @IsNotEmpty()
  // @Field(() => LarvaCourseServiceCefrLevel)
  // @IsEnum(LarvaCourseServiceCefrLevel)
  // level!: LarvaCourseServiceCefrLevel;

  @IsOptional()
  @Field(() => LarvaCourseServiceCourseStatus, { nullable: true })
  @IsEnum(LarvaCourseServiceCourseStatus)
  status?: LarvaCourseServiceCourseStatus;
}

@InputType({ description: 'Topic' })
export class LarvaCourseServiceSearchTopicGqlInput {
  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  name?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  level?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  categoryCode!: string;
}
