import { Field, InputType } from '@nestjs/graphql';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { VoucherDiscountType } from '../../../types';

@InputType()
export class VoucherServiceCreateVoucherGqlInput {
  @IsString()
  @Field()
  tenantId!: string;

  @IsString()
  @Field()
  code!: string;

  @IsString()
  @Field()
  voucherTypeId!: string;

  @IsString()
  @Field()
  userId!: string;

  @IsOptional()
  @IsString()
  @Field()
  campaignId!: string;

  @IsString()
  @Field()
  name!: string;

  @IsString()
  @Field()
  description!: string;

  @IsEnum(VoucherDiscountType)
  @Field(() => VoucherDiscountType)
  discountType!: VoucherDiscountType;

  @IsNumber()
  @Field()
  discountValue!: number;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true, defaultValue: 0 })
  minimumPurchase!: number;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  maximumDiscount?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true, defaultValue: [] })
  applicableProductIds!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true, defaultValue: [] })
  applicableCategoryIds!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true, defaultValue: [] })
  excludedProductIds!: string[];

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  imageFile?: string;

  @IsOptional()
  @IsDate()
  @Field()
  issueDate!: Date;

  @IsDate()
  @Field()
  startDate!: Date;

  @IsDate()
  @Field()
  endDate!: Date;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true, defaultValue: false })
  isRedeemed?: boolean;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  redeemedOrderId?: string;

  @IsOptional()
  @IsDate()
  @Field({ nullable: true })
  redeemedDate?: Date;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true, defaultValue: false })
  isExpired?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true, defaultValue: true })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true, defaultValue: false })
  isDeleted?: boolean;
}

@InputType()
export class VoucherServiceGetVoucherByIdGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  id!: string;
}

@InputType()
export class VoucherServiceGetVouchersByCampaignIdGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  campaignId!: string;
}

@InputType()
export class VoucherServiceUpdateVoucherGqlInput extends VoucherServiceCreateVoucherGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  id!: string;
}

@InputType()
export class VoucherServiceIssueVoucherGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  voucherTypeId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  campaignId?: string;
}

@InputType()
class CartItemInput {
  @Field(() => String)
  productId!: string;

  @Field(() => String)
  sku!: string;

  @Field(() => Number)
  quantity!: number;

  @Field(() => Number)
  unitPrice!: number;
}
@InputType()
export class VoucherServiceValidateAndApplyVoucherGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  userId!: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  @Field(() => [String])
  voucherIds!: string[];

  @Field(() => [CartItemInput])
  @ValidateNested({ each: true })
  @Field(() => [CartItemInput])
  cartItems!: CartItemInput[];

  @Field(() => Number, { nullable: true })
  shippingFee?: number;

  @Field(() => Boolean, { nullable: true })
  calculateOnly?: boolean;
}

@InputType()
export class VoucherServiceIncrementVoucherTypeRedemptionCountInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  voucherTypeId!: string;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number)
  incrementBy!: number;
}

export class VoucherServiceValidateAndApplyVoucherInput extends VoucherServiceValidateAndApplyVoucherGqlInput {}

export class VoucherServiceIssueVoucherInput extends VoucherServiceIssueVoucherGqlInput {}

export class VoucherServiceCreateVoucherInput extends VoucherServiceCreateVoucherGqlInput {}

export class VoucherServiceUpdateVoucherInput extends VoucherServiceUpdateVoucherGqlInput {}

export class VoucherServiceGetVoucherByIdInput extends VoucherServiceGetVoucherByIdGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  tenantId!: string;
}

export class VoucherServiceGetVouchersByCampaignIdInput extends VoucherServiceGetVouchersByCampaignIdGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  tenantId!: string;
}

export class VoucherServiceRedeemVoucherInput extends VoucherServiceValidateAndApplyVoucherInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  orderId!: string;
}

@InputType()
export class VoucherServiceBulkIssueGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  voucherTypeId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @Field(() => [String])
  userIds!: string[];
}

@InputType()
export class VoucherServiceBulkIssueAllGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  voucherTypeId!: string;
}

@InputType()
export class VoucherServiceRollbackVoucherByOrderIdGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  orderId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  userId!: string;
}

export class VoucherServiceRollbackVoucherByOrderIdInput extends VoucherServiceRollbackVoucherByOrderIdGqlInput {}
