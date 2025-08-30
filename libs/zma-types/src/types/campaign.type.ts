import { registerEnumType } from '@nestjs/graphql';

export enum CampaignStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  ENDED = 'ENDED',
  SCHEDULED = 'SCHEDULED',
}

export enum CampaignType {
  DISCOUNT = 'DISCOUNT',
  POINTS = 'POINTS',
  VOUCHER = 'VOUCHER',
  TIER_UPGRADE = 'TIER_UPGRADE',
  MIXED = 'MIXED',
}

export enum CampaignRecurringPattern {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum CampaignDiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum CampaignTriggerEventType {
  REGISTRATION = 'REGISTRATION',
  PURCHASE = 'PURCHASE',
  BIRTHDAY = 'BIRTHDAY',
  TIER_CHANGE = 'TIER_CHANGE',
  POINTS_THRESHOLD = 'POINTS_THRESHOLD',
}

export enum CampaignActionType {
  ADD_POINTS = 'ADD_POINTS',
  ISSUE_VOUCHER = 'ISSUE_VOUCHER',
  APPLY_DISCOUNT = 'APPLY_DISCOUNT',
  MIXED = 'MIXED',
}

export type CampaignTriggerAction = {
  type?: CampaignActionType;
  value?: number;
  actions?: {
    type: CampaignActionType;
    value: number;
    voucherTypeId?: string;
  }[];
  voucherTypeId?: string;
};

registerEnumType(CampaignStatus, {
  name: 'CampaignStatus',
  description: 'The status of the campaign',
});

registerEnumType(CampaignType, {
  name: 'CampaignType',
  description: 'The type of the campaign',
});

registerEnumType(CampaignRecurringPattern, {
  name: 'CampaignRecurringPattern',
  description: 'The recurring pattern of the campaign',
});

registerEnumType(CampaignDiscountType, {
  name: 'CampaignDiscountType',
  description: 'The discount type of the campaign',
});

registerEnumType(CampaignTriggerEventType, {
  name: 'CampaignTriggerEventType',
  description: 'The trigger event type of the campaign',
});

registerEnumType(CampaignActionType, {
  name: 'CampaignActionType',
  description: 'The action type of the campaign',
});
