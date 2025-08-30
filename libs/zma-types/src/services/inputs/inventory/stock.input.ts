import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Min, IsUUID, IsInt } from 'class-validator';

@InputType()
export class InventoryServiceStockGqlInput {
  @IsNotEmpty()
  @IsUUID()
  @Field(() => String)
  productId!: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  sku!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Field(() => Int)
  quantity!: number;
}

@InputType()
export class InventoryServiceCreateStockGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  productName!: string;

  @IsNotEmpty()
  @IsUUID()
  @Field(() => String)
  productId!: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  sku!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Field(() => Int)
  quantity!: number;
}

export class InventoryServiceStockInput extends InventoryServiceStockGqlInput {}
export class InventoryServiceCreateStockInput extends InventoryServiceCreateStockGqlInput {}

@InputType()
export class InventoryServiceProductIdAndSkuGqlInput {
  @IsNotEmpty()
  @IsUUID()
  @Field(() => String)
  productId!: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  sku!: string;
}

export class InventoryServiceProductIdAndSkuInput extends InventoryServiceProductIdAndSkuGqlInput {}
