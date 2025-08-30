import { Field, InputType, Int, Float } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

@InputType()
class DiscountInput {
  @Field(() => Float)
  percentage!: number;

  @Field(() => [String])
  applicableServices!: string[];
}

@InputType()
class BenefitDetailsInput {
  @Field(() => [DiscountInput], { nullable: true })
  @IsOptional()
  discounts?: DiscountInput[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  freeServices?: string[];

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  prioritySupport?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  exclusiveAccess?: boolean;
}

@InputType()
export class LoyaltyServiceCreateLoyaltyTierGqlInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  tenantId?: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  loyaltyProgramId!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  level!: number;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  description!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  iconFile!: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  spendingThreshold?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  pointsThreshold?: number;

  @Field(() => Float, { nullable: true, defaultValue: 1 })
  @IsOptional()
  pointsMultiplier?: number;

  @Field(() => [String], { nullable: true, defaultValue: [] })
  @IsOptional()
  benefits?: string[];

  @Field(() => BenefitDetailsInput, { nullable: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => BenefitDetailsInput)
  benefitDetails!: BenefitDetailsInput;

  @Field(() => Int, { nullable: true, defaultValue: 365 })
  @IsOptional()
  validityPeriod?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  maintenanceThreshold?: number;
}

@InputType()
export class LoyaltyServiceUpdateLoyaltyTierGqlInput extends LoyaltyServiceCreateLoyaltyTierGqlInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  id!: string;
}
