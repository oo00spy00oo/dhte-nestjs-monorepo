import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

import { VoucherDiscountType } from '../../../types';

@InputType()
export class VoucherServiceGetVoucherTypeByIdGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  voucherTypeId!: string;
}

@InputType()
export class VoucherServiceCreateVoucherTypeGqlInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String)
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  description!: string;

  @IsEnum(VoucherDiscountType)
  @IsNotEmpty()
  @Field(() => VoucherDiscountType)
  discountType!: VoucherDiscountType;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Field(() => Number)
  discountValue!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Field(() => Number, { nullable: true, defaultValue: 0 })
  minimumPurchase?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Field(() => Number, { nullable: true })
  maximumDiscount?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Field(() => [String], { defaultValue: [] })
  applicableProductIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Field(() => [String], { defaultValue: [] })
  applicableCategoryIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Field(() => [String], { defaultValue: [] })
  excludedProductIds?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Field(() => Number, { defaultValue: 0 })
  validityDays!: number;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { defaultValue: false })
  isSharedCode?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Field(() => Number, { nullable: true })
  globalRedemptionLimit?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Field(() => Number, { nullable: true })
  redemptionLimitPerUser?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Field(() => Number, { nullable: true })
  totalRedemptionLimit?: number;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { defaultValue: false })
  isStackable?: boolean;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  imageFile?: string;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { defaultValue: true })
  isEnabled?: boolean;

  @IsString()
  @IsOptional()
  @Field(() => String, { defaultValue: '' })
  termsAndConditions?: string;
}

export class VoucherServiceGetVoucherTypeByIdInput extends VoucherServiceGetVoucherTypeByIdGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  tenantId!: string;
}

export class VoucherServiceCreateVoucherTypeInput extends VoucherServiceCreateVoucherTypeGqlInput {}
