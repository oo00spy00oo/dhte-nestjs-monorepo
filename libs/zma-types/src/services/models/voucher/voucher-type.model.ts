import { Field, Float, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';

import { VoucherDiscountType } from '../../../types';

@ObjectType()
export class VoucherServiceVoucherTypeGqlOutput {
  @Field(() => String, { name: 'id' })
  _id?: string;

  @Field()
  tenantId!: string;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field(() => VoucherDiscountType)
  discountType!: VoucherDiscountType;

  @Field(() => Float)
  discountValue!: number;

  @Field(() => Float, { defaultValue: 0 })
  minimumPurchase!: number;

  @Field(() => Float, { nullable: true })
  maximumDiscount?: number;

  @Field(() => [String], { defaultValue: [] })
  applicableProductIds!: string[];

  @Field(() => [String], { defaultValue: [] })
  applicableCategoryIds!: string[];

  @Field(() => [String], { defaultValue: [] })
  excludedProductIds!: string[];

  @Field(() => Int, { defaultValue: 0 })
  validityDays!: number;

  @Field(() => Boolean, { defaultValue: false })
  isStackable!: boolean;

  @Field(() => String, { nullable: true })
  imageUrl?: string;

  @Field(() => Boolean, { defaultValue: true })
  isEnabled!: boolean;

  @Field(() => Boolean, { defaultValue: false })
  isDeleted!: boolean;

  @Field({ defaultValue: '' })
  termsAndConditions!: string;

  @Field(() => Int, { nullable: true })
  pointsRequired?: number;

  @Field(() => Boolean, { defaultValue: false })
  isSharedCode?: boolean;

  @Field(() => String, { nullable: true })
  sharedCode?: string;

  @Field(() => Int, { nullable: true })
  globalRedemptionLimit?: number;

  @Field(() => Int, { defaultValue: 0 })
  globalRedemptionCount!: number;

  @Field(() => Int, { nullable: true })
  redemptionLimitPerUser?: number;

  @Field(() => Int, { nullable: true })
  totalRedemptionLimit?: number;

  @Field(() => Int, { defaultValue: 0 })
  totalRedemptionCount!: number;

  @Field(() => GraphQLISODateTime, { nullable: true })
  createdAt?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  updatedAt?: Date;
}

export class VoucherServiceVoucherTypeOutput extends VoucherServiceVoucherTypeGqlOutput {}
