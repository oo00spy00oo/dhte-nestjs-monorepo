import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ShippingServiceShippingMethodGqlOutput {
  @Field(() => String, { name: 'id' })
  _id?: string;

  @Field()
  tenantId!: string;

  @Field()
  status!: boolean;

  @Field()
  provider!: string;

  @Field()
  providerLogoUrl!: string;

  @Field()
  providerId!: string;

  @Field()
  amount?: number;

  @Field()
  amountFormatted?: string;

  @Field()
  createdAt?: Date;

  @Field()
  updatedAt?: Date;
}

export class ShippingServiceShippingMethod extends ShippingServiceShippingMethodGqlOutput {}
