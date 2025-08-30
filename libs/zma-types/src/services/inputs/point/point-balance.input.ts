import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

import { PointTransactionSource, PointTransactionType } from '../../../types';

@InputType()
export class PointServiceCreatePointBalanceProfileGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  memberId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  loyaltyProgramId!: string;
}

@InputType()
export class PointServiceAddPointsForProfileGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  loyaltyProgramId!: string;

  @Field(() => Int)
  @IsNotEmpty()
  pointAmount!: number;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  transactionType!: PointTransactionType;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  source!: PointTransactionSource;

  @Field(() => String, { nullable: true })
  @IsString()
  sourceReference?: string;

  @Field(() => Date)
  @IsNotEmpty()
  transactionDate!: Date;
}

@InputType()
export class PointServiceRedeemPointsForVoucherGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  voucherTypeId!: string;
}

@InputType()
export class PointServiceGetPointBalanceByUserIdGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  tenantId!: string;
}

@InputType()
export class PointServiceCountPointTransactionsByUserIdGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  tenantId!: string;

  @Field(() => String)
  transactionType!: PointTransactionType;

  @Field(() => String)
  sourceReference!: string;
}

export class PointServiceCreatePointBalanceProfileInput extends PointServiceCreatePointBalanceProfileGqlInput {}

export class PointServiceAddPointsForProfileInput extends PointServiceAddPointsForProfileGqlInput {}

export class PointServiceGetPointBalanceByUserIdInput extends PointServiceGetPointBalanceByUserIdGqlInput {}

export class PointServiceCountPointTransactionsByUserIdInput extends PointServiceCountPointTransactionsByUserIdGqlInput {}
