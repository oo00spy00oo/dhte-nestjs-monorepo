import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { Pagination } from '../../../common';

@InputType()
export class CartServiceProductVariantGqlInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  sku!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Field(() => String)
  @IsString()
  @IsOptional()
  attributeKey?: string;

  @Field(() => String)
  @IsString()
  @IsOptional()
  attributeValue?: string;
}

@InputType()
export class CartServiceProductGqlInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  productId!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Field(() => Number)
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity!: number;

  @Field(() => CartServiceProductVariantGqlInput, { nullable: true })
  @IsOptional()
  variant?: CartServiceProductVariantGqlInput;
}

@InputType()
export class CartServiceCreateGqlInput {
  @Field(() => [CartServiceProductGqlInput])
  @IsNotEmpty()
  products!: CartServiceProductGqlInput[];
}

@InputType()
export class CartServiceUpdateGqlInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  cartId!: string;

  @Field(() => [CartServiceProductGqlInput])
  @IsNotEmpty()
  products!: CartServiceProductGqlInput[];
}

@InputType()
export class CartServiceDeleteGqlInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  cartId!: string;
}

@InputType()
export class CartServiceGetGqlInput extends Pagination {}

export class CartServiceCreateInput extends CartServiceCreateGqlInput {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class CartServiceUpdateInput extends CartServiceUpdateGqlInput {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class CartServiceDeleteInput extends CartServiceDeleteGqlInput {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class CartServiceDeleteMultipleInput {
  @IsNotEmpty()
  @IsString()
  cartIds!: string[];

  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class CartServiceGetInput extends CartServiceGetGqlInput {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}
