import { Field, ObjectType } from '@nestjs/graphql';
import { FindManyOutput } from '@zma-nestjs-monorepo/zma-types';

import { LarvaCourseServiceCourseStatus } from '../types';

@ObjectType()
export class LarvaCourseServiceTopicGqlOutput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => Number, { nullable: true })
  order?: number;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  image?: string;

  // @Field(() => String, { nullable: true })
  // level?: string;

  @Field(() => String, { nullable: true })
  subjectCode?: string;

  @Field(() => String, { nullable: true })
  skillCode?: string;

  @Field(() => String, { nullable: true })
  categoryCode?: string;

  @Field(() => LarvaCourseServiceCourseStatus, { nullable: true })
  status?: LarvaCourseServiceCourseStatus;

  @Field(() => String, { nullable: true })
  tenantId?: string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => Number, { nullable: true })
  totalLessons?: number;
}

@ObjectType()
export class LarvaCourseServiceTopicsGqlOutput extends FindManyOutput(
  LarvaCourseServiceTopicGqlOutput,
) {}

export class LarvaCourseServiceTopicOutput extends LarvaCourseServiceTopicGqlOutput {}
