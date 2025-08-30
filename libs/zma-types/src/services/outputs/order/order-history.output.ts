import { Field, ObjectType } from '@nestjs/graphql';

import {
  OrderServicePaymentStatus,
  OrderServiceShippingStatus,
  OrderServiceStatus,
} from '../../../enums';

@ObjectType({ description: 'Order History Entry' })
export class OrderServiceOrderHistoryGqlOutput {
  @Field(() => String, { name: 'id' })
  _id!: string;

  @Field(() => String)
  orderId!: string;

  @Field(() => String)
  tenantId!: string;

  @Field(() => String)
  description!: string;

  @Field(() => OrderServiceStatus)
  status!: OrderServiceStatus;

  @Field(() => OrderServiceShippingStatus, { nullable: true })
  shippingStatus?: OrderServiceShippingStatus;

  @Field(() => OrderServicePaymentStatus, { nullable: true })
  paymentStatus?: OrderServicePaymentStatus;

  @Field(() => String)
  updatedBy!: string;

  @Field(() => String, { nullable: true })
  comment?: string;

  @Field(() => String)
  createdAt!: string;
}

export class OrderServiceOrderHistory extends OrderServiceOrderHistoryGqlOutput {}
