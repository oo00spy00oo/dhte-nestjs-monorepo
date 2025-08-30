import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';

@InputType()
export class ProductServiceBuyProductInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  productId!: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  variantSku!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Field(() => Number)
  quantity!: number;
}

export class ProductServiceIdInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  id!: string;
}
