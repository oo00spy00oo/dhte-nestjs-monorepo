import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

import {
  PackageDurationUnitType,
  PaymentServiceCurrencyEnum,
  PaymentServiceRequestDirection,
  PaymentServiceVendor,
} from '../../../types';

export class PaymentServiceMomoSignatureParams {
  @IsOptional()
  accessKey?: string;

  @IsOptional()
  amount?: string;

  @IsOptional()
  extraData?: string;

  @IsOptional()
  message?: string;

  @IsOptional()
  orderId?: string;

  @IsOptional()
  orderInfo?: string;

  @IsOptional()
  orderType?: string;

  @IsOptional()
  partnerCode?: string;

  @IsOptional()
  payType?: string;

  @IsOptional()
  requestId?: string;

  @IsOptional()
  responseTime?: string;

  @IsOptional()
  resultCode?: string;

  @IsOptional()
  transId?: string;
}

export class PaymentServiceVnpaySignatureParams {
  @IsOptional()
  vnp_Amount?: string;

  @IsOptional()
  vnp_BankCode?: string;

  @IsOptional()
  vnp_BankTranNo?: string;

  @IsOptional()
  vnp_CardType?: string;

  @IsOptional()
  vnp_OrderInfo?: string;

  @IsOptional()
  vnp_PayDate?: string;

  @IsOptional()
  vnp_ResponseCode?: string;

  @IsOptional()
  vnp_TmnCode?: string;

  @IsOptional()
  vnp_TransactionNo?: string;

  @IsOptional()
  vnp_TransactionStatus?: string;

  @IsOptional()
  vnp_TxnRef?: string;
}

export class PaymentServiceCreateVendorLogDto {
  @IsEnum(PaymentServiceVendor)
  vendor!: PaymentServiceVendor;

  @IsEnum(PaymentServiceRequestDirection)
  direction!: PaymentServiceRequestDirection;

  @IsString()
  @IsNotEmpty()
  method!: string;

  @IsString()
  @IsNotEmpty()
  endpoint!: string;

  @IsString()
  @IsOptional()
  ip?: string;

  @IsObject()
  headers!: Record<string, unknown>;

  @IsObject()
  body!: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  response?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  statusCode?: number;
}

// Generic signature params to support any vendor
export type PaymentSignatureParams =
  | PaymentServiceMomoSignatureParams
  | PaymentServiceVnpaySignatureParams;

export class PaymentServiceIpnInput {
  @IsNotEmpty()
  @IsString()
  vendorResultCode!: string;

  @IsNotEmpty()
  @IsString()
  vendorTransactionId!: string;

  @IsOptional()
  @IsString()
  vendorMessage?: string;

  @IsOptional()
  @IsString()
  vendorStatus?: string;

  @IsNotEmpty()
  @IsString()
  orderId!: string;

  @IsNotEmpty()
  @IsString()
  signature!: string;

  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  @IsObject()
  rawParams!: PaymentSignatureParams;

  @IsOptional()
  vendorLog?: Buffer;
}

export class PaymentServiceMomoIpnPayload {
  @IsNotEmpty()
  @IsString()
  partnerCode!: string;

  @IsNotEmpty()
  @IsString()
  orderId!: string;

  @IsNotEmpty()
  @IsString()
  requestId!: string;

  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  orderInfo?: string;

  @IsOptional()
  @IsString()
  orderType?: string;

  @IsOptional()
  @IsNumber()
  transId?: number;

  @IsNotEmpty()
  @IsNumber()
  resultCode!: number;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  payType?: string;

  @IsOptional()
  @IsNumber()
  responseTime?: number;

  @IsOptional()
  @IsString()
  extraData?: string;

  @IsNotEmpty()
  @IsString()
  signature!: string;
}

export class PaymentServiceVnpayIpnPayload {
  @IsNotEmpty()
  @IsString()
  vnp_TmnCode!: string;

  @IsNotEmpty()
  @IsString()
  vnp_Amount!: string;

  @IsNotEmpty()
  @IsString()
  vnp_BankCode!: string;

  @IsOptional()
  @IsString()
  vnp_BankTranNo?: string;

  @IsOptional()
  @IsString()
  vnp_CardType?: string;

  @IsOptional()
  @IsString()
  vnp_PayDate?: string;

  @IsNotEmpty()
  @IsString()
  vnp_OrderInfo!: string;

  @IsNotEmpty()
  @IsString()
  vnp_TransactionNo!: string;

  @IsNotEmpty()
  @IsString()
  vnp_ResponseCode!: string;

  @IsNotEmpty()
  @IsString()
  vnp_TransactionStatus!: string;

  @IsNotEmpty()
  @IsString()
  vnp_TxnRef!: string;

  @IsNotEmpty()
  @IsString()
  vnp_SecureHash!: string;
}

export class PaymentServiceSubscriptionInput {
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
}

export class PaymentServiceCreatePaymentSubscriptionInput {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsString()
  tenantId!: string;

  @IsNotEmpty()
  @IsEnum(PaymentServiceVendor)
  vendor!: PaymentServiceVendor;

  @IsOptional()
  @IsString()
  userIp?: string;

  @IsNotEmpty()
  @IsObject()
  subscription!: PaymentServiceSubscriptionInput;
}
