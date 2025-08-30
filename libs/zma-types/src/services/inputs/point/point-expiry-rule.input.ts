import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { PointExpiryRuleType, PointSourceType } from '../../../types';

@InputType()
export class PointServiceCreatePointExpiryRuleProfileGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  loyaltyProgramId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  name!: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => PointSourceType)
  pointSourceType!: PointSourceType;

  @IsString()
  @IsNotEmpty()
  @Field(() => PointExpiryRuleType)
  expiryType!: PointExpiryRuleType;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  fixedDate?: Date;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  applicableTiers?: string[];

  @IsOptional()
  @Field(() => Int, { nullable: true })
  daysValid?: number;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;
}

@InputType()
export class PointServiceUpdatePointExpiryRuleProfileGqlInput extends PointServiceCreatePointExpiryRuleProfileGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  id!: string;
}

export class PointServiceCreatePointExpiryRuleProfileInput extends PointServiceCreatePointExpiryRuleProfileGqlInput {}
