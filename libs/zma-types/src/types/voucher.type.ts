import { registerEnumType } from '@nestjs/graphql';

export enum VoucherDiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_ITEM = 'FREE_ITEM',
  FREE_SHIPPING = 'FREE_SHIPPING',
  BOGO = 'BOGO',
}

export enum VoucherApplicabilityType {
  PER_ITEM = 'PER_ITEM',
  CART_LEVEL = 'CART_LEVEL',
}

registerEnumType(VoucherDiscountType, {
  name: 'VoucherDiscountType',
  description: 'The type of discount offered by the voucher',
});

registerEnumType(VoucherApplicabilityType, {
  name: 'VoucherApplicabilityType',
});
