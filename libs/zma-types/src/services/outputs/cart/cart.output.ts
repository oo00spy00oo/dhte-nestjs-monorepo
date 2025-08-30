import { Field, ObjectType } from '@nestjs/graphql';

import { CurrencyEnum } from '../../../enums';

@ObjectType({ description: 'Cart Product Variant' })
export class CartServiceCartProductVariantGqlOutput {
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

@ObjectType({ description: 'Cart Product' })
export class CartServiceCartProductGqlOutput {
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

  @Field(() => CartServiceCartProductVariantGqlOutput, { nullable: true })
  variant?: CartServiceCartProductVariantGqlOutput;
}

@ObjectType({ description: 'Cart' })
export class CartServiceCartGqlOutput {
  @Field(() => String, { name: 'id' })
  _id!: string;

  @Field(() => String)
  tenantId!: string;

  @Field(() => String)
  userId!: string;

  @Field(() => [CartServiceCartProductGqlOutput])
  products!: CartServiceCartProductGqlOutput[];

  @Field(() => Number)
  totalAmount!: number;

  @Field(() => String)
  totalAmountFormatted!: string;

  @Field(() => String)
  currency!: CurrencyEnum;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}

export class CartServiceCart extends CartServiceCartGqlOutput {}
export class CartServiceCartProduct extends CartServiceCartProductGqlOutput {}
export class CartServiceCartProductVariant extends CartServiceCartProductVariantGqlOutput {}
