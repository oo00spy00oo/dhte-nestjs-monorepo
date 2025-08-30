import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { SurveyQuestionType, SurveyType, SurveyUiTemplate } from '@zma-nestjs-monorepo/zma-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

import { UserResponseEntity } from '../../frameworks/data-services/mongo/entities';

registerEnumType(SurveyQuestionType, {
  name: 'SurveyQuestionType',
  description: 'Type of the survey question',
});

registerEnumType(SurveyType, {
  name: 'SurveyType',
  description: 'Type of the survey',
});

registerEnumType(SurveyUiTemplate, {
  name: 'SurveyUiTemplate',
  description: 'UI Template for the survey question',
});

@InputType()
export class FnsServiceSurveyQuestionGqlInput {
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  questionId?: string;

  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  @Field(() => Number)
  index!: number;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  text!: string;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @Field(() => Boolean)
  isRequired!: boolean;

  @IsNotEmpty()
  @IsEnum(SurveyQuestionType)
  @Field(() => SurveyQuestionType)
  type!: SurveyQuestionType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  options?: string[];

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Field(() => Number, { nullable: true })
  minValue?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Field(() => Number, { nullable: true })
  maxValue?: number;

  @IsNotEmpty()
  @IsEnum(SurveyUiTemplate)
  @Field(() => SurveyUiTemplate)
  uiTemplate!: SurveyUiTemplate;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  actionLabel?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  actionUrl?: string;
}

@InputType()
export class FnsServiceCreateSurveyGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  title!: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  description?: string;

  @IsNotEmpty()
  @IsEnum(SurveyType)
  @Field(() => SurveyType)
  type!: SurveyType;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @Field(() => Boolean)
  isAnonymous!: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FnsServiceSurveyQuestionGqlInput)
  @Field(() => [FnsServiceSurveyQuestionGqlInput])
  questions!: FnsServiceSurveyQuestionGqlInput[];
}

@InputType()
export class FnsServiceUpdateSurveyGqlInput {
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  title?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  description?: string;

  @IsOptional()
  @IsEnum(SurveyType)
  @Field(() => SurveyType, { nullable: true })
  type?: SurveyType;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  isAnonymous?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FnsServiceSurveyQuestionGqlInput)
  @Field(() => [FnsServiceSurveyQuestionGqlInput], { nullable: true })
  questions?: FnsServiceSurveyQuestionGqlInput[];
}

@InputType()
export class FnsServiceAnswerGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  questionId!: string;

  @IsNotEmpty()
  @Field(() => [String])
  answer!: string[];
}

@InputType()
export class FnsServiceCreateUserResponseSurveyGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  surveyId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FnsServiceAnswerGqlInput)
  @Field(() => [FnsServiceAnswerGqlInput])
  answers!: FnsServiceAnswerGqlInput[];
}

@InputType()
export class FnsServiceCreateUserResponseFormGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  formId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FnsServiceAnswerGqlInput)
  @Field(() => [FnsServiceAnswerGqlInput])
  answers!: FnsServiceAnswerGqlInput[];
}

@InputType()
export class FnsServiceCreateFormGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  title!: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  description?: string;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @Field(() => Boolean)
  isAnonymous!: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FnsServiceSurveyQuestionGqlInput)
  @Field(() => [FnsServiceSurveyQuestionGqlInput])
  questions!: FnsServiceSurveyQuestionGqlInput[];
}

@InputType()
export class FnsServiceUpdateFormGqlInput {
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  title?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  description?: string;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  isAnonymous?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FnsServiceSurveyQuestionGqlInput)
  @Field(() => [FnsServiceSurveyQuestionGqlInput], { nullable: true })
  questions?: FnsServiceSurveyQuestionGqlInput[];
}

@InputType()
export class FnsServiceFindUserResponsesToSurveyGqlInput {
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  surveyId?: string;
}

@InputType()
export class FnsServiceFindUserResponsesToFormGqlInput {
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  formId?: string;
}

export class FnsServiceUserResponseAddtionalInput {
  @IsOptional()
  @IsString()
  userName?: string;

  @IsOptional()
  @IsString()
  formTitle?: string;

  @IsOptional()
  @IsString()
  surveyTitle?: string;

  @IsArray()
  questions?: {
    questionId: string;
    questionName: string;
  }[];
}

export class FnsServiceUserResponseFactoryInput {
  entity: UserResponseEntity;
  additionalInput?: FnsServiceUserResponseAddtionalInput;
}
