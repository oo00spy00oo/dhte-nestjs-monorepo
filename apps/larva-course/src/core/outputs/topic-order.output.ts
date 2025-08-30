import { Field, ObjectType } from '@nestjs/graphql';
import { FindManyOutput } from '@zma-nestjs-monorepo/zma-types';

import { LarvaCourseServiceCourseStatus } from '../types';

@ObjectType()
export class LarvaCourseServiceTopicOrderGqlOutput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  categoryCode?: string;

  @Field(() => [String], { nullable: true })
  topicIds?: string[];

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
}

@ObjectType()
export class LarvaCourseServiceTopicOrdersGqlOutput extends FindManyOutput(
  LarvaCourseServiceTopicOrderGqlOutput,
) {}
