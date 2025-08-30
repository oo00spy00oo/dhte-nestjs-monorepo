import { Field, ID, ObjectType } from '@nestjs/graphql';

import { CampaignRecurringPattern, CampaignStatus, CampaignType } from '../../../types';

@ObjectType()
class BenefitConfig {
  @Field(() => String, { nullable: true })
  discountType?: string;

  @Field(() => Number, { nullable: true })
  discountValue?: number;

  @Field(() => Number, { nullable: true })
  pointsToEarn?: number;

  @Field(() => Number, { nullable: true })
  pointsMultiplier?: number;

  @Field(() => String, { nullable: true })
  voucherTypeId?: string;

  @Field(() => String, { nullable: true })
  tierUpgrade?: string;
}

@ObjectType()
class EligibilityRules {
  @Field(() => [String], { nullable: true })
  membershipTiers?: string[];

  @Field(() => Number, { nullable: true })
  minimumSpend?: number;

  @Field(() => Boolean, { nullable: true })
  firstPurchaseOnly?: boolean;

  @Field(() => [String], { nullable: true })
  productCategories?: string[];

  @Field(() => [String], { nullable: true })
  excludedProducts?: string[];
}

@ObjectType({
  description: 'Campaign',
})
export class CampaignServiceCampaignGqlOutput {
  @Field(() => ID)
  _id?: string;

  @Field()
  tenantId!: string;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field(() => Date)
  startDate!: Date;

  @Field(() => Date)
  endDate!: Date;

  @Field(() => CampaignStatus)
  status!: CampaignStatus;

  @Field(() => CampaignType)
  campaignType!: CampaignType;

  @Field(() => BenefitConfig, { nullable: true })
  benefitConfig?: BenefitConfig;

  @Field(() => EligibilityRules, { nullable: true })
  eligibilityRules?: EligibilityRules;

  @Field(() => Boolean)
  isRecurring!: boolean;

  @Field(() => CampaignRecurringPattern, { nullable: true })
  recurringPattern?: CampaignRecurringPattern;

  @Field(() => Number, { nullable: true })
  usageLimitPerUser?: number;

  @Field(() => Boolean)
  isStackable!: boolean;

  @Field(() => String, { nullable: true })
  targetAudience?: string;

  @Field(() => Number, { nullable: true })
  targetParticipants?: number;

  @Field(() => Number, { nullable: true })
  currentParticipants?: number;

  @Field(() => Number, { nullable: true })
  voucherLimit?: number;

  @Field(() => Number, { nullable: true })
  vouchersIssued?: number;

  @Field(() => [String])
  locations!: string[];

  @Field(() => String, { nullable: true })
  bannerUrl?: string;

  @Field(() => Boolean)
  isEnabled!: boolean;

  @Field(() => Boolean)
  isDeleted!: boolean;

  @Field(() => Number)
  priority!: number;

  @Field(() => Date)
  createdAt?: Date;

  @Field(() => Date)
  updatedAt?: Date;
}

@ObjectType({
  description: 'CampaignService UserRegisteredEvent Output',
})
export class CampaignServiceUserRegisteredEventGqlOutput {
  @Field(() => Boolean)
  success!: boolean;

  @Field(() => String, { nullable: true })
  message?: string;
}

export class CampaignServiceCampaignOutput extends CampaignServiceCampaignGqlOutput {}

export class CampaignServiceUserRegisteredEventOutput extends CampaignServiceUserRegisteredEventGqlOutput {}
