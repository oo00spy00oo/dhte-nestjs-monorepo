import { Field, ObjectType } from '@nestjs/graphql';
import {
  FindManyOutput,
  SurveyQuestionType,
  SurveyType,
  SurveyUiTemplate,
} from '@zma-nestjs-monorepo/zma-types';
import { IsEnum } from 'class-validator';

@ObjectType()
export class FnsServiceSurveyQuestionGqlOutput {
  @Field(() => String, { name: 'id' })
  questionId?: string;

  @Field(() => Number, { nullable: true })
  index?: number;

  @Field(() => String, { nullable: true })
  text?: string;

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @Field(() => Boolean, { nullable: true })
  isRequired?: boolean;

  @IsEnum(SurveyQuestionType)
  @Field(() => SurveyQuestionType, { nullable: true })
  type?: SurveyQuestionType;

  @Field(() => [String], { nullable: true })
  options?: string[];

  @Field(() => Number, { nullable: true })
  minValue?: number;

  @Field(() => Number, { nullable: true })
  maxValue?: number;

  @IsEnum(SurveyUiTemplate)
  @Field(() => SurveyUiTemplate, { nullable: true })
  uiTemplate?: SurveyUiTemplate;

  @Field(() => String, { nullable: true })
  actionLabel?: string;

  @Field(() => String, { nullable: true })
  actionUrl?: string;
}

@ObjectType()
export class FnsServiceSurveyGqlOutput {
  @Field(() => String, { name: 'id' })
  _id?: string;

  @Field(() => String, { nullable: true })
  tenantId?: string;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @IsEnum(SurveyType)
  @Field(() => SurveyType, { nullable: true })
  type?: SurveyType;

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @Field(() => Boolean, { nullable: true })
  isAnonymous?: boolean;

  @Field(() => [FnsServiceSurveyQuestionGqlOutput], { nullable: true })
  questions?: FnsServiceSurveyQuestionGqlOutput[];

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class FnsServiceSurveysGqlOutput extends FindManyOutput(FnsServiceSurveyGqlOutput) {}

@ObjectType()
export class FnsServiceFormGqlOutput {
  @Field(() => String, { name: 'id' })
  _id?: string;

  @Field(() => String, { nullable: true })
  tenantId?: string;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @Field(() => Boolean, { nullable: true })
  isAnonymous?: boolean;

  @Field(() => [FnsServiceSurveyQuestionGqlOutput], { nullable: true })
  questions?: FnsServiceSurveyQuestionGqlOutput[];

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class FnsServiceFormsGqlOutput extends FindManyOutput(FnsServiceFormGqlOutput) {}
