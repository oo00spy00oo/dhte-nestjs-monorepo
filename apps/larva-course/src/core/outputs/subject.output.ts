import { Field, ObjectType } from '@nestjs/graphql';

import { LarvaCourseServiceCourseStatus } from '../types';

@ObjectType()
export class LarvaCourseServiceCategoryStaticGqlOutput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  code?: string;

  @Field(() => LarvaCourseServiceCourseStatus, { nullable: true })
  status?: LarvaCourseServiceCourseStatus;
}

@ObjectType()
export class LarvaCourseServiceSkillStaticGqlOutput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  code?: string;

  @Field(() => LarvaCourseServiceCourseStatus, { nullable: true })
  status?: LarvaCourseServiceCourseStatus;

  @Field(() => String, { nullable: true })
  image?: string;

  @Field(() => Number)
  totalTopics?: number;

  @Field(() => [LarvaCourseServiceCategoryStaticGqlOutput], { nullable: true })
  categories?: LarvaCourseServiceCategoryStaticGqlOutput[];
}

@ObjectType()
export class LarvaCourseServiceSubjectsGqlOutput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  code?: string;

  @Field(() => LarvaCourseServiceCourseStatus, { nullable: true })
  status?: LarvaCourseServiceCourseStatus;

  @Field(() => String, { nullable: true })
  image?: string;

  @Field(() => [LarvaCourseServiceSkillStaticGqlOutput], { nullable: true })
  skills?: LarvaCourseServiceSkillStaticGqlOutput[];

  @Field(() => String, { nullable: true })
  surveyId?: string;

  @Field(() => Boolean, { nullable: true })
  hasSurveyResponse?: boolean;
}

export class LarvaCourseServiceSubjectStaticOutput extends LarvaCourseServiceSubjectsGqlOutput {}
