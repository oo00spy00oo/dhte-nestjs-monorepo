import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

import {
  CurrencyEnum,
  OrderServicePaymentMethod,
  OrderServicePaymentStatus,
  OrderServiceShippingStatus,
  OrderServiceStatus,
  OrderServiceType,
} from '../../../enums';

registerEnumType(OrderServiceStatus, { name: 'OrderServiceStatus' });
registerEnumType(OrderServiceShippingStatus, { name: 'OrderServiceShippingStatus' });
registerEnumType(OrderServicePaymentStatus, { name: 'OrderServicePaymentStatus' });
registerEnumType(OrderServicePaymentMethod, { name: 'OrderServicePaymentMethod' });

@ObjectType({ description: 'Order Product Variant' })
export class OrderServiceProductVariantGqlOutput {
  @Field(() => String)
  sku!: string;

  @Field(() => String)
  name!: string;

  @Field(() => Number)
  price!: number;

  @Field(() => String)
  priceFormatted!: string;

  @Field(() => String, { nullable: true })
  attributeKey?: string;

  @Field(() => String, { nullable: true })
  attributeValue?: string;
}

@ObjectType({ description: 'Order Product' })
export class OrderServiceProductGqlOutput {
  @Field(() => String)
  productId!: string;

  @Field(() => String)
  currency!: CurrencyEnum;

  @Field(() => String, { nullable: true })
  thumbnailFile?: string;

  @Field(() => String)
  name!: string;

  @Field(() => Number)
  quantity!: number;

  @Field(() => Number)
  price!: number;

  @Field(() => String)
  priceFormatted!: string;

  @Field(() => OrderServiceProductVariantGqlOutput, { nullable: true })
  variant?: OrderServiceProductVariantGqlOutput;
}

@ObjectType({ description: 'Order Shipping Address' })
export class OrderServiceShippingAddressGqlOutput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  address!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  province!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  ward!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  phone!: string;
}

@ObjectType({ description: 'Payment Information' })
export class OrderServicePaymentInfoGqlOutput {
  @Field(() => String)
  transactionId!: string;

  @Field(() => Number)
  amountPaid!: number;

  @Field(() => String)
  amountPaidFormatted!: string;

  @Field(() => String)
  paidAt!: string;

  @Field(() => String, { nullable: true })
  refundId?: string;
}

@ObjectType({ description: 'Order' })
export class OrderServiceOrderGqlOutput {
  @Field(() => String, { name: 'id' })
  _id!: string;

  @Field(() => String)
  tenantId!: string;

  @Field(() => String, { nullable: true })
  branchId?: string;

  @Field(() => String)
  userId!: string;

  @Field(() => String)
  currency!: CurrencyEnum;

  @Field(() => String)
  type!: OrderServiceType;

  @Field(() => [OrderServiceProductGqlOutput])
  products!: OrderServiceProductGqlOutput[];

  @Field(() => Number)
  totalAmount!: number;

  @Field(() => String)
  totalAmountFormatted!: string;

  @Field(() => Number)
  productTotalAmount!: number;

  @Field(() => String)
  productTotalAmountFormatted!: string;

  @Field(() => Number, { nullable: true })
  discountAmount?: number;

  @Field(() => String, { nullable: true })
  discountAmountFormatted?: string;

  @Field(() => String, { nullable: true })
  promotionId?: string;

  @Field(() => [String], { nullable: true })
  vouchers?: string[];

  @Field(() => String)
  status!: OrderServiceStatus;

  @Field(() => OrderServiceShippingStatus, { nullable: true })
  shippingStatus?: OrderServiceShippingStatus;

  @Field(() => OrderServiceShippingAddressGqlOutput, { nullable: true })
  shippingAddress?: OrderServiceShippingAddressGqlOutput;

  @Field(() => String, { nullable: true })
  shippingMethod?: string;

  @Field(() => String, { nullable: true })
  shippingNote?: string;

  @Field(() => Number, { nullable: true })
  shippingFee?: number;

  @Field(() => String, { nullable: true })
  shippingFeeFormatted?: string;

  @Field(() => OrderServicePaymentInfoGqlOutput, { nullable: true })
  payment?: OrderServicePaymentInfoGqlOutput;

  @Field(() => String, { nullable: true })
  paymentMethod?: string;

  @Field(() => OrderServicePaymentStatus, { nullable: true })
  paymentStatus?: OrderServicePaymentStatus;

  @Field(() => String)
  createdAt!: string;

  @Field(() => String)
  updatedAt!: string;
}

export class OrderServiceOrder extends OrderServiceOrderGqlOutput {
  secretToken?: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paymentInfo?: any;
}

export class OrderServiceProduct extends OrderServiceProductGqlOutput {}
export class OrderServiceProductVariant extends OrderServiceProductVariantGqlOutput {}
export class OrderServiceShippingAddress extends OrderServiceShippingAddressGqlOutput {}
export class OrderServicePaymentInfo extends OrderServicePaymentInfoGqlOutput {}
