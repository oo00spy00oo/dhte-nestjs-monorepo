import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import {
  CampaignStatus,
  CampaignType,
  CampaignDiscountType,
  CampaignRecurringPattern,
} from '../../../types';

@InputType()
class BenefitConfigInput {
  @IsOptional()
  @IsString()
  @Field(() => CampaignDiscountType, { nullable: true })
  discountType?: CampaignDiscountType;

  @IsOptional()
  @IsInt()
  @Field({ nullable: true })
  discountValue?: number;

  @IsOptional()
  @IsInt()
  @Field({ nullable: true })
  pointsToEarn?: number;

  @IsOptional()
  @IsInt()
  @Field({ nullable: true })
  pointsMultiplier?: number;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  voucherTypeId?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  tierUpgrade?: string;
}

@InputType()
class EligibilityRulesInput {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  membershipTiers?: string[];

  @IsOptional()
  @IsInt()
  @Field({ nullable: true })
  minimumSpend?: number;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  firstPurchaseOnly?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  productCategories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  excludedProducts?: string[];
}

@InputType()
export class CampaignServiceCreateCampaignGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field()
  tenantId!: string;

  @IsNotEmpty()
  @IsString()
  @Field()
  name!: string;

  @IsNotEmpty()
  @IsString()
  @Field()
  description!: string;

  @IsNotEmpty()
  @IsDate()
  @Field()
  startDate!: Date;

  @IsNotEmpty()
  @IsDate()
  @Field()
  endDate!: Date;

  @IsOptional()
  @IsEnum(CampaignStatus)
  @Field(() => CampaignStatus, { defaultValue: CampaignStatus.DRAFT })
  status!: CampaignStatus;

  @IsNotEmpty()
  @IsEnum(CampaignType)
  @Field(() => CampaignType)
  campaignType!: CampaignType;

  @Field(() => BenefitConfigInput, { nullable: true })
  @IsOptional()
  benefitConfig?: BenefitConfigInput;

  @Field(() => EligibilityRulesInput, { nullable: true })
  @IsOptional()
  eligibilityRules?: EligibilityRulesInput;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true, defaultValue: false })
  isRecurring?: boolean;

  @IsOptional()
  @IsEnum(CampaignRecurringPattern)
  @Field(() => CampaignRecurringPattern, { nullable: true })
  recurringPattern?: CampaignRecurringPattern;

  @IsOptional()
  @IsInt()
  @Field({ nullable: true })
  usageLimitPerUser?: number;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true, defaultValue: false })
  isStackable?: boolean;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  targetAudience?: string;

  @IsOptional()
  @IsInt()
  @Field({ nullable: true, defaultValue: 0 })
  targetParticipants?: number;

  @IsOptional()
  @IsInt()
  @Field({ nullable: true, defaultValue: 0 })
  voucherLimit?: number;

  @IsOptional()
  @IsInt()
  @Field({ nullable: true, defaultValue: 0 })
  vouchersIssued?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true, defaultValue: [] })
  locations?: string[];

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  bannerFile?: string;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true, defaultValue: true })
  isEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true, defaultValue: false })
  isDeleted?: boolean;

  @IsOptional()
  @IsInt()
  @Field({ nullable: true, defaultValue: 0 })
  priority?: number;
}

@InputType()
export class CampaignServiceUpdateCampaignGqlInput extends CampaignServiceCreateCampaignGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field()
  id!: string;
}

@InputType()
export class CampaignServiceGetCampaignByIdGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  id!: string;
}

@InputType()
export class CampaignServiceGetAllCampaignsGqlInput {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Field(() => Number, { nullable: true })
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Field(() => Number, { nullable: true })
  limit?: number;
}

@InputType()
export class CampaignServiceUserRegisteredEventGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  tenantId!: string;

  @IsString()
  @Field(() => String, { nullable: true })
  loyaltyProgramId?: string;
}

export class CampaignServiceGetCampaignByIdInput extends CampaignServiceGetCampaignByIdGqlInput {}

export class CampaignServiceGetAllCampaignsInput extends CampaignServiceGetAllCampaignsGqlInput {}

export class CampaignServiceUserRegisteredEventInput extends CampaignServiceUserRegisteredEventGqlInput {}
