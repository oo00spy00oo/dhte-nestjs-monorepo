import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';

import { PaymentServiceCurrencyEnum, PackageDurationUnitType } from '../../../types';

export class SubscriptionServiceGetSubscriptionStatusByIdOutput {
  @IsString()
  id!: string;

  @IsNumber()
  amount!: number;

  @IsEnum(PaymentServiceCurrencyEnum)
  currency!: PaymentServiceCurrencyEnum;

  @IsString()
  packageName!: string;

  @IsString()
  pricingName!: string;

  @IsNumber()
  duration!: number;

  @IsEnum(PackageDurationUnitType)
  durationUnit!: PackageDurationUnitType;

  @IsArray()
  @IsString({ each: true })
  paymentMethods!: string[];
}
