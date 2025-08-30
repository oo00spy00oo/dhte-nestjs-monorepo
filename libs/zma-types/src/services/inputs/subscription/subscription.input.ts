import { registerEnumType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsEnum, IsDateString } from 'class-validator';

import { PaymentServicePaymentStatus } from '../../../types';

registerEnumType(PaymentServicePaymentStatus, {
  name: 'PaymentServicePaymentStatus',
});

export class SubscriptionServiceUpdatePaymentStatusKafkaInput {
  @IsNotEmpty()
  @IsString()
  requestId!: string;

  @IsNotEmpty()
  @IsString()
  tenantId!: string;

  @IsNotEmpty()
  @IsString()
  userSubscriptionId!: string;

  @IsEnum(PaymentServicePaymentStatus)
  @IsNotEmpty()
  paymentStatus!: PaymentServicePaymentStatus;

  @IsNotEmpty()
  @IsString()
  transactionId!: string;

  @IsNotEmpty()
  @IsDateString()
  timestamp!: string;
}

export class SubscriptionServiceGetSubscriptionStatusByIdInput {
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  id!: string;
}
