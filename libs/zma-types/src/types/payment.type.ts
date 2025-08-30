export enum PaymentServiceVendor {
  MoMo = 'MOMO',
  VNPay = 'VNPAY',
  GooglePay = 'GOOGLE_PAY',
  ApplePay = 'APPLE_PAY',
  Paypal = 'PAYPAL',
  CreditCard = 'CREDIT_CARD',
}

export enum PaymentServicePaymentStatus {
  Pending = 'PENDING',
  Paid = 'PAID',
  Failed = 'FAILED',
  Refunded = 'REFUNDED',
}

export enum PaymentServiceType {
  Subscription = 'SUBSCRIPTION',
  Product = 'PRODUCT',
}

export enum PaymentServiceMomoRequestType {
  CaptureWallet = 'captureWallet',
  LinkWallet = 'linkWallet',
  Subscription = 'subscription',
}

export enum PaymentServiceVnpayCommand {
  Pay = 'pay',
}

export enum PaymentServiceVnpayBankcode {
  VnPayQR = 'VNPAYQR',
  VnBank = 'VNBANK',
  IntCard = 'INTCARD',
}

export enum PaymentServiceCurrencyEnum {
  Vnd = 'VND',
  Usd = 'USD',
}

export enum PaymentServiceVnpayIpnResponseCode {
  Success = '00',
  OrderNotFound = '01',
  OrderAlreadyProcessed = '02',
  InvalidAmount = '04',
  ChecksumError = '97',
  SystemError = '99',
}

export enum PaymentServiceRequestDirection {
  Incoming = 'INCOMING',
  Outgoing = 'OUTGOING',
}

export enum PaymentServicePlatformType {
  Web = 'WEB',
  Android = 'ANDROID',
  IOS = 'IOS',
}
