import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('EarnRules')
class EarnRules {
  @Field(() => Number)
  amountSpentRatio?: number;

  @Field(() => Number)
  registrationBonus?: number;

  @Field(() => Number)
  referralBonus?: number;
}

@ObjectType('RedemptionRules')
class RedemptionRules {
  @Field(() => Number)
  minimumPoints?: number;

  @Field(() => Number)
  pointValue?: number;
}

@ObjectType('PointsConfig')
class PointsConfig {
  @Field(() => Number)
  expiryDays?: number;

  @Field(() => EarnRules)
  earnRules?: EarnRules;

  @Field(() => RedemptionRules)
  redemptionRules?: RedemptionRules;
}

@ObjectType('CustomTheme')
class CustomTheme {
  @Field(() => String, { nullable: true })
  primaryColor?: string;

  @Field(() => String, { nullable: true })
  secondaryColor?: string;

  @Field(() => String, { nullable: true })
  logoUrl?: string;
}

@ObjectType('Integrations')
class Integrations {
  @Field(() => String, { nullable: true })
  externalSystemId?: string;

  @Field(() => [String], { nullable: true })
  apiKeys?: string[];
}

@ObjectType('AdditionalSettings')
class AdditionalSettings {
  @Field(() => Boolean, { nullable: true })
  notificationEnabled?: boolean;

  @Field(() => String, { nullable: true })
  emailTemplateId?: string;

  @Field(() => Boolean, { nullable: true })
  displayInApp?: boolean;

  @Field(() => CustomTheme, { nullable: true })
  customTheme?: CustomTheme;

  @Field(() => Integrations, { nullable: true })
  integrations?: Integrations;
}

@ObjectType('LoyaltyProgram')
export class LoyaltyServiceLoyaltyProgramGqlOutput {
  @Field(() => ID)
  _id?: string;

  @Field(() => String)
  tenantId!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  description!: string;

  @Field(() => GraphQLISODateTime)
  startDate!: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  endDate?: Date;

  @Field(() => Boolean)
  isActive?: boolean;

  @Field(() => Boolean)
  isDefault?: boolean;

  @Field(() => PointsConfig)
  pointsConfig?: PointsConfig;

  @Field(() => AdditionalSettings, { nullable: true })
  additionalSettings?: AdditionalSettings;

  @Field(() => Boolean)
  isEnabled?: boolean;

  @Field(() => Boolean)
  isDeleted?: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  createdAt?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  updatedAt?: Date;
}

export class LoyaltyServiceLoyaltyProgramOutput extends LoyaltyServiceLoyaltyProgramGqlOutput {}
