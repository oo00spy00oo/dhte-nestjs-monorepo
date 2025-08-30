import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { FeatureEnum, FeatureFlagOperatorEnum, FeatureFlagTypeEnum } from '../../../enums';

registerEnumType(FeatureFlagOperatorEnum, {
  name: 'FeatureFlagOperatorEnum',
});

registerEnumType(FeatureEnum, {
  name: 'FeatureFlagFeatureEnum',
  description: 'Available feature codes the client can use',
});

registerEnumType(FeatureFlagTypeEnum, {
  name: 'FeatureFlagTypeEnum',
});

@InputType()
export class FeatureFlagServiceCreateFeatureFlagGqlInput {
  @IsNotEmpty()
  @IsArray()
  @Field(() => [FeatureFlagServiceFeatureFlagDataGqlInput], { nullable: true })
  featureFlagData!: FeatureFlagServiceFeatureFlagDataGqlInput[];

  @IsNotEmpty()
  @IsArray()
  @Field(() => [FeatureFlagServiceRuleGqlInput], { nullable: false })
  rules!: FeatureFlagServiceRuleGqlInput[];

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  description?: string;

  @IsNotEmpty()
  @Field(() => FeatureFlagTypeEnum, { nullable: false })
  type!: FeatureFlagTypeEnum;
}

@InputType()
export class FeatureFlagServiceFeatureFlagDataGqlInput {
  @IsString()
  @Field(() => String, { nullable: false })
  featureCode!: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  description?: string;
}

@InputType()
export class FeatureFlagServiceConditionGqlInput {
  @IsNotEmpty()
  @Field(() => FeatureFlagOperatorEnum, { nullable: false })
  operator!: FeatureFlagOperatorEnum;

  @IsNotEmpty()
  @IsString({ each: true })
  @IsArray()
  @Field(() => [String], { nullable: false })
  values!: string[];

  @IsNotEmpty()
  @IsString()
  @Field({ nullable: false })
  key!: string;
}

@InputType()
export class FeatureFlagServiceRuleGqlInput {
  @IsNotEmpty()
  @IsNumber()
  @Field({ nullable: false })
  priority!: number;

  @IsNotEmpty()
  @IsBoolean()
  @Field({ nullable: false })
  isEnabled!: boolean;

  @IsNotEmpty()
  @IsArray()
  @Field(() => [FeatureFlagServiceConditionGqlInput], { nullable: false })
  conditions!: FeatureFlagServiceConditionGqlInput[];
}

@InputType()
export class FeatureFlagServiceGetFeatureFlagGqlInput {
  @IsOptional()
  @Field({ nullable: true })
  plan?: string;

  @IsOptional()
  @Field({ nullable: true })
  tenantId?: string;
}

@InputType()
export class FeatureFlagServiceGetAllFeatureFlagGqlInput {
  @IsOptional()
  @Field(() => [FeatureFlagTypeEnum], { nullable: true })
  types?: FeatureFlagTypeEnum[];
}

@InputType()
export class FeatureFlagServiceGetFeatureFlagDetailGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field({ nullable: false })
  id!: string;

  @IsNotEmpty()
  @Field(() => FeatureFlagTypeEnum, { nullable: true })
  type?: FeatureFlagTypeEnum;
}

@InputType()
export class FeatureFlagServiceUpdateRuleGqlInput {
  @IsNotEmpty()
  @IsNumber()
  @Field({ nullable: false })
  priority!: number;

  @IsNotEmpty()
  @IsBoolean()
  @Field({ nullable: false })
  isEnabled!: boolean;

  @IsNotEmpty()
  @IsArray()
  @Field(() => [FeatureFlagServiceConditionGqlInput], { nullable: false })
  conditions!: FeatureFlagServiceConditionGqlInput[];
}

@InputType()
export class FeatureFlagServiceUpdateFeatureFlagGqlInput {
  @IsOptional()
  @Field(() => String, { nullable: true })
  description?: string;

  @IsNotEmpty()
  @Field(() => FeatureFlagTypeEnum, { nullable: true })
  type?: FeatureFlagTypeEnum;

  @IsNotEmpty()
  @IsArray()
  @Field(() => [FeatureFlagServiceUpdateRuleGqlInput], { nullable: false })
  rules!: FeatureFlagServiceUpdateRuleGqlInput[];
}

export class FeatureFlagServiceCreateFeatureFlagInput extends FeatureFlagServiceCreateFeatureFlagGqlInput {}

export class FeatureFlagServiceUpdateFeatureFlagInput extends FeatureFlagServiceUpdateFeatureFlagGqlInput {}

export class FeatureFlagServiceGetAllFeatureFlagInput extends FeatureFlagServiceGetAllFeatureFlagGqlInput {}

export class FeatureFlagServiceGetFeatureFlagDetailInput extends FeatureFlagServiceGetFeatureFlagDetailGqlInput {}
