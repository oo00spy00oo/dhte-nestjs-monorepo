export enum UserSubscriptionStatusType {
  Trialing = 'TRIALING',
  Active = 'ACTIVE',
  PastDue = 'PAST_DUE',
  PendingCancellation = 'PENDING_CANCELLATION',
  Cancelled = 'CANCELLED',
  Expired = 'EXPIRED',
  Paused = 'PAUSED',
  Pending = 'PENDING',
}

export enum PackageBillingCycleType {
  Recurring = 'RECURRING',
  OneTime = 'ONE_TIME',
}

export enum PackageDurationUnitType {
  Day = 'DAY',
  Week = 'WEEK',
  Month = 'MONTH',
  Year = 'YEAR',
}
