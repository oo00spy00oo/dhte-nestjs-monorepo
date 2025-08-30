import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class OrderHistoryServiceGetGqlInput {
  @Field(() => String)
  @IsNotEmpty()
  orderId!: string;
}

export class OrderHistoryServiceGetInput extends OrderHistoryServiceGetGqlInput {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsString()
  userType?: string;
}
