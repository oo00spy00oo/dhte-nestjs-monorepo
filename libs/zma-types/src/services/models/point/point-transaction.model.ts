import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

import { PointTransactionSource, PointTransactionType } from '../../../types/point.type';

// Register enum types for GraphQL
registerEnumType(PointTransactionType, {
  name: 'PointTransactionType',
  description: 'Types of point transactions',
});

registerEnumType(PointTransactionSource, {
  name: 'PointTransactionSource',
  description: 'Sources of point transactions',
});

@ObjectType('PointTransaction')
export class PointServicePointTransactionGqlOutput {
  @Field(() => ID, { nullable: true })
  _id?: string;

  @Field()
  tenantId!: string;

  @Field()
  userId!: string;

  @Field(() => Int)
  amount!: number;

  @Field(() => PointTransactionType)
  transactionType!: PointTransactionType;

  @Field(() => PointTransactionSource)
  source!: PointTransactionSource;

  @Field({ nullable: true })
  sourceReference?: string;

  @Field(() => Date)
  transactionDate!: Date;

  @Field(() => Date, { nullable: true })
  expiryDate?: Date;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isExpired?: boolean;

  @Field({ nullable: true, defaultValue: '' })
  description?: string;

  @Field({ nullable: true })
  performedBy?: string;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  isActive?: boolean;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

export class PointServicePointTransactionOutput extends PointServicePointTransactionGqlOutput {}
