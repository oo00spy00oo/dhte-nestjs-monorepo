export enum UserServiceUserType {
  Admin = 'ADMIN',
  Agency = 'AGENCY',
  OrganizationAdmin = 'ORGANIZATION_ADMIN',
  TenantAdmin = 'TENANT_ADMIN',
  User = 'USER',
  Zalo = 'ZALO',
}

export enum UserServiceUserStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Suspended = 'SUSPENDED',
  Pending = 'PENDING',
}

export enum UserServiceGender {
  Male = 'M',
  Female = 'F',
}

export enum UserServiceUserSortField {
  Email = 'email',
  FirstName = 'firstName',
  LastName = 'lastName',
  CreatedAt = 'createdAt',
  UpdatedAt = 'updatedAt',
  Status = 'status',
}
