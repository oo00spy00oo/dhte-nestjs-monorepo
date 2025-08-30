/**
 * User role enumeration for role-based access control (RBAC)
 *
 * Defines the hierarchy of user roles within the system:
 * - SuperAdmin: Full system access across all tenants
 * - Admin: Full access within their tenant/organization
 * - Operator: Limited administrative access for operational tasks
 * - Customer: Standard user with customer-level permissions
 * - User: Basic user with minimal permissions
 *
 * @enum {string}
 */
export enum UserRole {
  /** System-wide administrator with full access to all tenants */
  SuperAdmin = 'SUPER_ADMIN',

  /** Tenant/organization administrator with full tenant access */
  Admin = 'ADMIN',

  /** Operational user with limited administrative capabilities */
  Operator = 'OPERATOR',

  /** Customer user with standard e-commerce permissions */
  Customer = 'CUSTOMER',

  /** Basic user with minimal system access */
  User = 'USER',
}

/**
 * Type guard to check if a value is a valid UserRole
 * @param value - Value to check
 * @returns True if value is a valid UserRole
 */
export const isValidUserRole = (value: string): value is UserRole => {
  return Object.values(UserRole).includes(value as UserRole);
};

/**
 * Get the display name for a user role
 * @param role - The user role
 * @returns Human-readable display name
 */
export const getUserRoleDisplayName = (role: UserRole): string => {
  const displayNames: Record<UserRole, string> = {
    [UserRole.SuperAdmin]: 'Super Administrator',
    [UserRole.Admin]: 'Administrator',
    [UserRole.Operator]: 'Operator',
    [UserRole.Customer]: 'Customer',
    [UserRole.User]: 'User',
  };
  return displayNames[role];
};
