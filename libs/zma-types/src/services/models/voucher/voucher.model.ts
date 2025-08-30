import { Field, ObjectType, Float } from '@nestjs/graphql';

import { VoucherDiscountType } from '../../../types';

@ObjectType({ description: 'Voucher' })
export class VoucherServiceVoucherGqlOutput {
  @Field(() => String, { name: 'id' })
  _id?: string;

  @Field()
  tenantId!: string;

  @Field()
  name!: string;

  @Field()
  code!: string;

  @Field()
  voucherTypeId!: string;

  @Field()
  userId!: string;

  @Field({ nullable: true })
  campaignId?: string;

  @Field()
  description!: string;

  @Field(() => VoucherDiscountType)
  discountType!: VoucherDiscountType;

  @Field(() => Number)
  discountValue!: number;

  @Field(() => Number, { defaultValue: 0 })
  minimumPurchase!: number;

  @Field(() => Number, { nullable: true })
  maximumDiscount?: number;

  @Field(() => [String], { defaultValue: [] })
  applicableProductIds!: string[];

  @Field(() => [String], { defaultValue: [] })
  applicableCategoryIds!: string[];

  @Field(() => [String], { defaultValue: [] })
  excludedProductIds!: string[];

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => Date)
  issueDate!: Date;

  @Field(() => Date)
  startDate!: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field(() => Boolean, { defaultValue: false })
  isRedeemed?: boolean;

  @Field({ nullable: true })
  redeemedOrderId?: string;

  @Field(() => Date, { nullable: true })
  redeemedDate?: Date;

  @Field(() => Boolean, { defaultValue: false })
  isExpired?: boolean;

  @Field(() => Boolean, { defaultValue: true })
  isActive?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  isDeleted!: boolean;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

@ObjectType('VoucherReservation')
export class VoucherReservation {
  @Field(() => String)
  reservationId!: string;

  @Field(() => Date)
  expiryDate!: Date;
}

@ObjectType('ProductDiscountDetail')
export class ProductDiscountDetail {
  @Field(() => String)
  productId!: string;

  @Field(() => Float)
  originalPrice!: number;

  @Field(() => Float)
  discountedPrice!: number;

  @Field(() => Float)
  discountAmount!: number;
}

@ObjectType('VoucherApplicationResult')
export class VoucherApplicationResult {
  @Field(() => Boolean)
  isApplicable!: boolean;

  @Field(() => [String], { nullable: true })
  applicableProductIds?: string[];

  @Field(() => Float)
  discountAmount!: number;

  @Field(() => [ProductDiscountDetail], { nullable: true })
  productDiscounts?: ProductDiscountDetail[];

  @Field(() => VoucherReservation, { nullable: true })
  reservation?: VoucherReservation;

  @Field(() => String, { nullable: true })
  errorMessage?: string;
}

@ObjectType('VoucherDetail')
export class VoucherDetail {
  @Field(() => String)
  voucherId!: string;

  @Field(() => String)
  code!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => VoucherDiscountType)
  discountType!: VoucherDiscountType;

  @Field(() => Float)
  discountValue!: number;

  @Field(() => Float, { nullable: true })
  maximumDiscount?: number;

  @Field(() => VoucherApplicationResult)
  applicationResult!: VoucherApplicationResult;
}

@ObjectType({ description: 'VoucherValidateAndApply' })
export class VoucherServiceValidateAndApplyVoucherOutput {
  @Field(() => [VoucherDetail])
  vouchers!: VoucherDetail[];

  @Field(() => Float)
  totalDiscountAmount!: number;

  @Field(() => Boolean)
  hasApplicableVouchers!: boolean;

  @Field(() => [String], { nullable: true })
  invalidIds?: string[];
}

@ObjectType()
export class VoucherServiceIncrementVoucherTypeRedemptionCountOutput {
  @Field()
  success!: boolean;

  @Field(() => String, { nullable: true })
  errorMessage?: string;
}

export class VoucherServiceVoucherOutput extends VoucherServiceVoucherGqlOutput {}

@ObjectType('RedeemedVoucher')
export class RedeemedVoucher {
  @Field(() => String)
  voucherId!: string;

  @Field(() => String)
  code!: string;

  @Field(() => Float)
  discountAmount!: number;

  @Field(() => Boolean)
  isRedeemed!: boolean;

  @Field(() => String, { nullable: true })
  message?: string;
}

@ObjectType({ description: 'VoucherRedeem' })
export class VoucherServiceRedeemVoucherOutput {
  @Field(() => Boolean)
  success!: boolean;

  @Field(() => [RedeemedVoucher])
  redeemedVouchers!: RedeemedVoucher[];

  @Field(() => Float)
  totalDiscountAmount!: number;
}

@ObjectType({ description: 'VoucherRollback' })
export class VoucherServiceRollbackVoucherByOrderIdOutput {
  @Field(() => Boolean)
  success!: boolean;

  @Field(() => String, { nullable: true })
  message?: string;
}
