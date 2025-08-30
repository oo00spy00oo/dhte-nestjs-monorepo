import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

import { VoucherServiceVoucherGqlOutput } from '../voucher/voucher.model';

@ObjectType('PointBalance')
export class PointServicePointBalanceGqlOutput {
  @Field(() => ID, { nullable: true })
  _id?: string;

  @Field()
  tenantId!: string;

  @Field()
  userId!: string;

  @Field({ nullable: true })
  memberId?: string;

  @Field(() => Int)
  totalPoints!: number;

  @Field(() => Int)
  availablePoints!: number;

  @Field(() => Int)
  pendingPoints!: number;

  @Field(() => Int)
  expiredPoints!: number;

  @Field(() => Int)
  redeemedPoints!: number;

  @Field(() => GraphQLJSON)
  pointsBreakdown?: {
    [expiryDate: string]: number;
  };

  @Field(() => Date, { nullable: true })
  lastUpdated?: Date;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class PointServiceRedeemPointsForVoucherGqlOutput {
  @Field(() => Boolean)
  success!: boolean;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => VoucherServiceVoucherGqlOutput, { nullable: true })
  voucher?: VoucherServiceVoucherGqlOutput;
}

@ObjectType()
export class PointServiceAddPointsForProfileOutput {
  @Field(() => Boolean)
  success!: boolean;
}

@ObjectType()
export class PointServiceCountPointTransactionsByUserIdOutput {
  @Field(() => Int)
  count!: number;
}

export class PointServicePointBalanceOutput extends PointServicePointBalanceGqlOutput {}
