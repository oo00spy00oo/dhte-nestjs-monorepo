import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class LoyaltyServiceGetDefaultLoyaltyProgramGqlInput {}

@InputType()
class CustomThemeInput {
  @Field(() => String, { nullable: true })
  @IsString()
  primaryColor?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  secondaryColor?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  logoUrl?: string;
}

@InputType()
class IntegrationsInput {
  @Field(() => String, { nullable: true })
  @IsString()
  externalSystemId?: string;

  @Field(() => [String], { nullable: true })
  apiKeys?: string[];
}

@InputType()
class LoyaltyProgramAdditionalSettingsInput {
  @Field(() => Boolean, { nullable: true })
  notificationEnabled?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  emailTemplateId?: string;

  @Field(() => Boolean, { nullable: true })
  displayInApp?: boolean;

  @Field(() => CustomThemeInput, { nullable: true })
  customTheme?: CustomThemeInput;

  @Field(() => IntegrationsInput, { nullable: true })
  integrations?: IntegrationsInput;
}

@InputType()
class EarnRulesInput {
  @Field(() => Number)
  @IsNotEmpty()
  amountSpentRatio!: number;

  @Field(() => Number)
  @IsNotEmpty()
  registrationBonus!: number;

  @Field(() => Number)
  @IsNotEmpty()
  referralBonus!: number;
}

@InputType()
class RedemptionRulesInput {
  @Field(() => Number)
  @IsNotEmpty()
  minimumPoints!: number;

  @Field(() => Number)
  @IsNotEmpty()
  pointValue!: number;
}

@InputType()
class PointsConfigInput {
  @Field(() => Number)
  @IsOptional()
  expiryDays?: number;

  @Field(() => EarnRulesInput)
  @IsNotEmpty()
  earnRules!: EarnRulesInput;

  @Field(() => RedemptionRulesInput)
  @IsNotEmpty()
  redemptionRules!: RedemptionRulesInput;
}

@InputType()
export class LoyaltyServiceCreateLoyaltyProgramGqlInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  tenantId?: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  description!: string;

  @Field(() => Date)
  @IsNotEmpty()
  startDate!: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  @IsOptional()
  isActive?: boolean;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  @IsOptional()
  isEnabled?: boolean;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  isDefault?: boolean;

  @Field(() => PointsConfigInput)
  @IsNotEmpty()
  pointsConfig!: PointsConfigInput;

  @Field(() => LoyaltyProgramAdditionalSettingsInput, { nullable: true })
  additionalSettings?: LoyaltyProgramAdditionalSettingsInput;
}

export class LoyaltyServiceGetDefaultLoyaltyProgramInput extends LoyaltyServiceGetDefaultLoyaltyProgramGqlInput {}

export class LoyaltyServiceCreateLoyaltyProgramInput extends LoyaltyServiceCreateLoyaltyProgramGqlInput {}
