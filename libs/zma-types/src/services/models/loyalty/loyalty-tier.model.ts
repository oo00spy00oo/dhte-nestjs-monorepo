import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('LoyaltyTierDiscount')
class LoyaltyTierDiscount {
  @Field(() => Int)
  percentage?: number;

  @Field(() => [String])
  applicableServices?: string[];
}

@ObjectType('LoyaltyTierBenefitDetails')
class LoyaltyTierBenefitDetails {
  @Field(() => [LoyaltyTierDiscount], { nullable: true })
  discounts?: LoyaltyTierDiscount[];

  @Field(() => [String], { nullable: true })
  freeServices?: string[];

  @Field(() => Boolean, { nullable: true })
  prioritySupport?: boolean;

  @Field(() => Boolean, { nullable: true })
  exclusiveAccess?: boolean;
}

@ObjectType('LoyaltyTier')
export class LoyaltyServiceLoyaltyTierGqlOutput {
  @Field(() => String, { nullable: true })
  _id?: string;

  @Field(() => String)
  tenantId!: string;

  @Field(() => String)
  loyaltyProgramId!: string;

  @Field(() => String)
  name!: string;

  @Field(() => Int)
  level!: number;

  @Field(() => String)
  description!: string;

  @Field(() => String)
  iconUrl!: string;

  @Field(() => Int, { nullable: true })
  spendingThreshold?: number;

  @Field(() => Int, { nullable: true })
  pointsThreshold?: number;

  @Field(() => Int, { nullable: true })
  pointsMultiplier?: number;

  @Field(() => [String], { nullable: true })
  benefits?: string[];

  @Field(() => LoyaltyTierBenefitDetails, { nullable: true })
  benefitDetails?: LoyaltyTierBenefitDetails;

  @Field(() => Int, { nullable: true })
  validityPeriod?: number;

  @Field(() => Int, { nullable: true })
  maintenanceThreshold?: number;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

export class LoyaltyServiceLoyaltyTierOutput extends LoyaltyServiceLoyaltyTierGqlOutput {}
