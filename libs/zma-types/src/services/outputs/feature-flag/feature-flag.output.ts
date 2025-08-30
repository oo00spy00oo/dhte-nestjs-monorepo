import { Field, ObjectType } from '@nestjs/graphql';

import { FeatureFlagOperatorEnum, FeatureFlagTypeEnum } from '../../../enums';

@ObjectType({ description: 'Feature flag' })
export class FeatureFlagServiceFeatureFlagGqlOutput {
  @Field(() => String)
  id?: string;

  @Field(() => String, { nullable: true })
  featureCode?: string;

  @Field(() => [FeatureFlagServiceRuleGqlOutput], { nullable: false })
  rules?: FeatureFlagServiceRuleGqlOutput[];

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  isEnabled?: boolean;

  @Field(() => FeatureFlagTypeEnum, { nullable: true })
  type?: FeatureFlagTypeEnum;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  @Field({ nullable: true })
  tenantId?: string;
}

@ObjectType()
export class FeatureFlagServiceConditionGqlOutput {
  @Field(() => FeatureFlagOperatorEnum, { nullable: false })
  operator?: FeatureFlagOperatorEnum;

  @Field(() => [String], { nullable: false })
  values?: string[];

  @Field({ nullable: false })
  key?: string;
}

@ObjectType()
export class FeatureFlagServiceRuleGqlOutput {
  @Field({ nullable: false })
  priority?: number;

  @Field(() => [FeatureFlagServiceConditionGqlOutput], { nullable: false })
  conditions?: FeatureFlagServiceConditionGqlOutput[];

  @Field({ nullable: true })
  isEnabled?: boolean;
}

export class FeatureFlagServiceFeatureFlagOutput extends FeatureFlagServiceFeatureFlagGqlOutput {}
