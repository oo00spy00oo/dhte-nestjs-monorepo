import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ShippingServiceProviderGqlOutput {
  @Field(() => String, { name: 'id' })
  _id?: string;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field(() => Number, { nullable: true })
  fixedPrice?: number;

  @Field()
  logoUrl!: string;

  @Field()
  status!: boolean;
}

export class ShippingServiceProvider extends ShippingServiceProviderGqlOutput {}
