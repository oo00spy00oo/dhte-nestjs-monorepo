import { registerEnumType } from '@nestjs/graphql';

export enum MembershipTierTransitionType {
  UPGRADE = 'UPGRADE',
  DOWNGRADE = 'DOWNGRADE',
  MANUAL = 'MANUAL',
}

export enum MembershipTierTransitionReason {
  SPENDING_THRESHOLD = 'SPENDING_THRESHOLD',
  POINTS_THRESHOLD = 'POINTS_THRESHOLD',
  ADMIN_ACTION = 'ADMIN_ACTION',
  TIER_EXPIRY = 'TIER_EXPIRY',
}

export enum MembershipBenefitType {
  DISCOUNT = 'DISCOUNT',
  FREE_SERVICE = 'FREE_SERVICE',
  PRIORITY = 'PRIORITY',
  EXCLUSIVE_ACCESS = 'EXCLUSIVE_ACCESS',
}

registerEnumType(MembershipTierTransitionType, {
  name: 'MembershipTierTransitionType',
  description: 'The type of transition between membership tiers',
});

registerEnumType(MembershipTierTransitionReason, {
  name: 'MembershipTierTransitionReason',
  description: 'The reason for the transition between membership tiers',
});

registerEnumType(MembershipBenefitType, {
  name: 'MembershipBenefitType',
  description: 'The type of benefit associated with a membership tier',
});
