export enum UserServiceTenantStatus {
  Active = 'ACTIVE',
  Suspended = 'SUSPENDED',
  Pending = 'PENDING',
  Archived = 'ARCHIVED',
  Disabled = 'DISABLED',
}

export enum UserServiceTenantBillingStatus {
  Paid = 'PAID',
  Overdue = 'OVERDUE',
  Trial = 'TRIAL',
  Cancelled = 'CANCELLED',
}

export enum UserServiceTenantType {
  Base = 'BASE',
  Pro = 'PRO',
  Enterprise = 'ENTERPRISE',
}

export enum UserServiceTenantSortField {
  Name = 'name',
  CreatedAt = 'createdAt',
  UpdatedAt = 'updatedAt',
  Status = 'status',
}
