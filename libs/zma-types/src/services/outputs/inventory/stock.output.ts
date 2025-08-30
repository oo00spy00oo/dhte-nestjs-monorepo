import { Field, ObjectType, Int } from '@nestjs/graphql';

import { FindManyOutput } from '../../../common';

@ObjectType()
export class InventoryServiceStockGqlOutput {
  @Field(() => String, { name: 'id' })
  _id?: string;

  @Field(() => String)
  tenantId?: string;

  @Field(() => String)
  productName?: string;

  @Field(() => String)
  productId!: string;

  @Field(() => String)
  sku!: string;

  @Field(() => Int)
  totalQuantity?: number;

  @Field(() => Int)
  reservedQuantity?: number;

  @Field(() => Int)
  availableQuantity?: number;

  @Field(() => Int)
  soldQuantity?: number;

  @Field(() => Boolean)
  isDeleted?: boolean;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => Date)
  createdAt?: Date;

  @Field(() => Date)
  updatedAt?: Date;
}

@ObjectType()
export class InventoryServiceStocksGqlOutput extends FindManyOutput(
  InventoryServiceStockGqlOutput,
) {}

export class InventoryServiceStockOutput extends InventoryServiceStockGqlOutput {}

export class InventoryServiceStocksOutput extends InventoryServiceStocksGqlOutput {}
