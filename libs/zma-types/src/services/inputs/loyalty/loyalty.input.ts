import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class LoyaltyServiceGetDefaultLoyaltyTierGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  loyaltyProgramId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  tenantId!: string;
}

@InputType()
export class LoyaltyServiceGetNextLoyaltyTierGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  tierId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  tenantId!: string;
}

@InputType()
export class LoyaltyServiceGetLoyaltyTierByIdInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  id!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  tenantId!: string;
}

export class LoyaltyServiceGetDefaultLoyaltyTierInput extends LoyaltyServiceGetDefaultLoyaltyTierGqlInput {}

export class LoyaltyServiceGetNextLoyaltyTierInput extends LoyaltyServiceGetNextLoyaltyTierGqlInput {}
