import { Field, ID, InputType, registerEnumType } from '@nestjs/graphql';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { Pagination, SortDirection } from '../../../common';
import { OrderServiceSortField, OrderServiceStatus } from '../../../enums';

registerEnumType(OrderServiceSortField, { name: 'OrderServiceSortField' });

@InputType()
export class OrderServiceShippingAddressInput {
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
  phone!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  ward!: string;
}

@InputType()
export class OrderServiceCreateGqlInput {
  @Field(() => [String])
  @IsNotEmpty()
  cartIds!: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  vouchers?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  shippingMethod?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  shippingNote?: string;

  @Field(() => OrderServiceShippingAddressInput, { nullable: true })
  @IsOptional()
  shippingAddress?: OrderServiceShippingAddressInput;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  branchId?: string;
}

@InputType()
export class OrderServiceCancelOrderGqlInput {
  @Field(() => String)
  @IsNotEmpty()
  orderId!: string;
}

@InputType()
export class OrderServiceDeleteGqlInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  orderId!: string;
}

@InputType()
export class OrderServiceDetailGqlInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  id!: string;
}

@InputType()
export class OrderServiceGetGqlInput extends Pagination {
  @Field(() => OrderServiceStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrderServiceStatus)
  status?: OrderServiceStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field(() => OrderServiceSortField, { nullable: true })
  @IsOptional()
  @IsEnum(OrderServiceSortField)
  sortBy?: OrderServiceSortField;

  @Field(() => SortDirection, { nullable: true })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

@InputType()
export class OrderServiceUpdateStatusGqlInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  id!: string;

  @Field(() => OrderServiceStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrderServiceStatus)
  status?: OrderServiceStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class OrderServiceCreateInput extends OrderServiceCreateGqlInput {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class OrderServiceUpdateInput extends OrderServiceCancelOrderGqlInput {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class OrderServiceDeleteInput extends OrderServiceDeleteGqlInput {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class OrderServiceGetInput extends OrderServiceGetGqlInput {
  // userId and tenantId are now inherited from OrderServiceGetGqlInput
}

export class OrderServiceDetailInput extends OrderServiceDetailGqlInput {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class OrderServiceUpdateStatusInput extends OrderServiceUpdateStatusGqlInput {
  @IsNotEmpty()
  @IsString()
  userId!: string;
}
