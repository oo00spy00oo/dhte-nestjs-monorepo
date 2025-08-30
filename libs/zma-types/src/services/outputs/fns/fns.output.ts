import { Field, ObjectType } from '@nestjs/graphql';

import { FindManyOutput } from '../../../common';

@ObjectType()
export class FnsServiceAnswerGqlOutput {
  @Field(() => String, { nullable: true })
  questionId?: string;

  @Field(() => String, { nullable: true })
  questionName?: string;

  @Field(() => [String], { nullable: true })
  answer?: string[];
}

@ObjectType()
export class FnsServiceUserResponseGqlOutput {
  @Field(() => String, { name: 'id' })
  id?: string;

  @Field(() => String, { nullable: true })
  tenantId?: string;

  @Field(() => String, { nullable: true })
  surveyId?: string;

  @Field(() => String, { nullable: true })
  surveyTitle?: string;

  @Field(() => String, { nullable: true })
  formId?: string;

  @Field(() => String, { nullable: true })
  formTitle?: string;

  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => String, { nullable: true })
  userName?: string;

  @Field(() => String, { nullable: true })
  ipAddress?: string;

  @Field(() => String, { nullable: true })
  userAgent?: string;

  @Field(() => [FnsServiceAnswerGqlOutput], { nullable: true })
  answers?: FnsServiceAnswerGqlOutput[];

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class FnsServiceUserResponsesGqlOutput extends FindManyOutput(
  FnsServiceUserResponseGqlOutput,
) {}

export class FnsServiceUserResponseOutput extends FnsServiceUserResponseGqlOutput {}
