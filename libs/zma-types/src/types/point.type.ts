import { registerEnumType } from '@nestjs/graphql';

export enum PointTransactionType {
  EARN = 'EARN',
  REDEEM = 'REDEEM',
  EXPIRE = 'EXPIRE',
  ADJUST = 'ADJUST',
  TRANSFER = 'TRANSFER',
}

export enum PointExpiryRuleType {
  DAYS_AFTER_EARN = 'DAYS_AFTER_EARN',
  FIXED_DATE = 'FIXED_DATE',
  END_OF_YEAR = 'END_OF_YEAR',
  END_OF_QUARTER = 'END_OF_QUARTER',
  NEVER = 'NEVER',
}

export enum PointSourceType {
  ALL = 'ALL',
  REGISTRATION = 'REGISTRATION',
  PURCHASE = 'PURCHASE',
  BIRTHDAY = 'BIRTHDAY',
  REFERRAL = 'REFERRAL',
  CAMPAIGN = 'CAMPAIGN',
  MANUAL = 'MANUAL',
}

export enum PointTransactionSource {
  // Point earning sources
  REGISTRATION = 'REGISTRATION', // New account registration
  PURCHASE = 'PURCHASE', // Purchase of products/services
  CAMPAIGN = 'CAMPAIGN', // From marketing campaigns
  REFERRAL = 'REFERRAL', // Referring new users
  BIRTHDAY = 'BIRTHDAY', // Birthday rewards
  LOGIN = 'LOGIN', // Daily login
  REVIEW = 'REVIEW', // Reviews/content creation
  EVENT = 'EVENT', // Event participation
  PROMOTION = 'PROMOTION', // Special promotions
  ENGAGEMENT = 'ENGAGEMENT', // Social engagement
  ACHIEVEMENT = 'ACHIEVEMENT', // Completing achievements

  // Point redemption sources
  REDEMPTION = 'REDEMPTION', // Redeeming points for rewards/vouchers
  TIER_UPGRADE = 'TIER_UPGRADE', // Membership tier upgrade

  // Adjustments
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT', // Adjustment by admin
  REFUND = 'REFUND', // Points refund
  EXPIRATION = 'EXPIRATION', // Points expiration
  SYSTEM = 'SYSTEM', // System adjustment
  CORRECTION = 'CORRECTION', // Error correction

  // Other
  OTHER = 'OTHER', // Other sources
}

registerEnumType(PointTransactionType, {
  name: 'PointTransactionType',
  description: 'The type of point transaction',
});

registerEnumType(PointExpiryRuleType, {
  name: 'PointExpiryRuleType',
  description: 'The type of point expiry rule',
});

registerEnumType(PointSourceType, {
  name: 'PointSourceType',
  description: 'The type of point source',
});

registerEnumType(PointTransactionSource, {
  name: 'PointTransactionSource',
  description: 'The source of the point transaction',
});
