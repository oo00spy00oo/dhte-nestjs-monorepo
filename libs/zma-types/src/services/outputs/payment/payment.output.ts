import { Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@ObjectType({
  description: 'Payment Service Create Payment Output',
})
export class PaymentServiceCreatePaymentGqlOutput {
  @Field(() => String, { nullable: true })
  redirectUrl?: string;
}

export class PaymentServiceMomoIpnOutput {}

export class PaymentServiceVnpayIpnOutput {
  @IsString()
  RspCode?: string;

  @IsString()
  Message?: string;
}

export class PaymentServiceCreatePaymentOutput extends PaymentServiceCreatePaymentGqlOutput {}
