import { Field, ObjectType } from '@nestjs/graphql';

import { LarvaCourseServiceHistoryLessonStatus } from '../types';

@ObjectType()
export class LarvaCourseServiceHistoryLessonSpeakingGqlOutput {
  @Field(() => String, { nullable: true })
  lessonSpeakingId?: string;

  @Field(() => Number, { nullable: true })
  mark?: number;
}

@ObjectType()
export class LarvaCourseServiceHistoryLessonGqlOutput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => String, { nullable: true })
  tenantId?: string;

  @Field(() => String, { nullable: true })
  lessonId?: string;

  @Field(() => [LarvaCourseServiceHistoryLessonSpeakingGqlOutput], { nullable: true })
  lessonSpeakings?: LarvaCourseServiceHistoryLessonSpeakingGqlOutput[];

  @Field(() => Number, { nullable: true })
  summaryMark?: number;

  @Field(() => LarvaCourseServiceHistoryLessonStatus, { nullable: true })
  status?: LarvaCourseServiceHistoryLessonStatus;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
export class LarvaCourseServiceHistoryLessonOutput extends LarvaCourseServiceHistoryLessonGqlOutput {}
