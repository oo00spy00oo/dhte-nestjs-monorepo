import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

import { CurrencyEnum } from '../../../enums';

@ObjectType()
export class ProductAttributeOutput {
  @Field(() => String)
  key!: string;

  @Field(() => String)
  value!: string;
}

@ObjectType()
export class SummarizedAttribute {
  @Field(() => String)
  key!: string;

  @Field(() => String)
  displayName!: string;

  @Field(() => [String])
  values!: string[];
}

@ObjectType()
export class ProductVariantOutput {
  @Field(() => [ProductAttributeOutput], { nullable: true })
  attributes?: ProductAttributeOutput[];

  @Field(() => String)
  sku!: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => [String], { nullable: true })
  mediaFiles?: string[];

  @Field(() => Number)
  price!: number;

  @Field(() => String)
  priceFormatted!: string;
}

@ObjectType()
export class ProductServiceProductRating {
  @Field(() => Number)
  average!: number;

  @Field(() => Number)
  total!: number;
}

@ObjectType()
export class ProductServiceProductOutput {
  @Field(() => String, { name: 'id' })
  _id?: string;

  @Field(() => String, { nullable: true })
  tenantId?: string;

  @Field(() => String)
  title!: string;

  @Field(() => [String])
  categories!: string[];

  @Field(() => [String], { nullable: true })
  mediaFiles?: string[];

  @Field(() => String, { nullable: true })
  thumbnailFile?: string;

  @Field(() => [String], { nullable: true })
  merchantNames?: string[];

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => [String])
  tags?: string[];

  @Field(() => [ProductAttributeOutput])
  commonAttributes?: ProductAttributeOutput[];

  @Field(() => [ProductVariantOutput], { nullable: true })
  variants?: ProductVariantOutput[];

  @Field(() => CurrencyEnum)
  currency!: CurrencyEnum;

  @Field(() => ProductServiceProductRating)
  rating?: ProductServiceProductRating;

  @Field(() => [SummarizedAttribute], { nullable: true })
  summarizedAttributes!: SummarizedAttribute[];

  @Field({ defaultValue: false })
  isEnabled?: boolean;

  @Field({ defaultValue: false })
  isDeleted?: boolean;

  @Field({ defaultValue: false })
  isLatest?: boolean;

  @Field({ defaultValue: false })
  isFeatured?: boolean;

  @Field(() => GraphQLISODateTime)
  createdAt?: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt?: Date;
}
