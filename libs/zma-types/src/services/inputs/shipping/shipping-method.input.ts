import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ShippingServiceShippingMethodAvailableGqlInput {
  @Field(() => [String])
  cartIds!: string[];
}

export class ShippingServiceShippingMethodAvailableInput extends ShippingServiceShippingMethodAvailableGqlInput {}
