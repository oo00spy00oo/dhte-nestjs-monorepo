import { UserServiceUserType } from '../services';

/**
 * Authentication action verbs for RBAC system
 *
 * Defines the types of operations that can be performed on resources.
 * These verbs correspond to CRUD operations and access control patterns.
 */
export enum AuthActionVerb {
  /** View access (read-only, list access) */
  View = 'VIEW',

  /** Read access (detailed access to specific resources) */
  Read = 'READ',

  /** Create access (ability to create new resources) */
  Create = 'CREATE',

  /** Update access (ability to modify existing resources) */
  Update = 'UPDATE',

  /** Delete access (ability to remove resources) */
  Delete = 'DELETE',
}

/**
 * Resource possession levels for RBAC system
 *
 * Defines the scope of access control, from system-wide admin access
 * to user-specific ownership restrictions.
 */
export enum AuthPossession {
  /** Administrator access (system-wide, unrestricted) */
  Admin = 'ADMIN',

  /** Any access (all resources of this type) */
  Any = 'ANY',

  /** Own access (only resources owned by the user) */
  Own = 'OWN',

  /** Tenant access (all resources within the user's tenant) */
  Tenant = 'TENANT',

  /** Organization access (all resources within the user's organization) */
  Organization = 'ORGANIZATION',
}

/**
 * System resources that can be protected by RBAC
 *
 * Defines all the resource types that the authorization system
 * can control access to.
 */
export enum AuthResource {
  /** User management */
  User = 'USER',

  /** Role management */
  Role = 'ROLE',

  /** Permission management */
  Permission = 'PERMISSION',

  /** Tenant administration */
  Tenant = 'TENANT',

  /** Organization management */
  Organization = 'ORGANIZATION',

  /** Order processing */
  Order = 'ORDER',

  /** Branch management */
  Branch = 'BRANCH',

  /** File upload system */
  Upload = 'UPLOAD',

  /** Product catalog */
  Product = 'PRODUCT',

  /** Form management */
  Form = 'FORM',

  /** Survey system */
  Survey = 'SURVEY',

  /** Content management */
  Content = 'CONTENT',
}

/**
 * Resource access mapping by user type
 *
 * Defines which resources each user type has default access to.
 * This serves as a baseline for permission assignment.
 */
export const AuthResourceByUserType = {
  [UserServiceUserType.Admin]: [],
  [UserServiceUserType.OrganizationAdmin]: [
    AuthResource.User,
    AuthResource.Role,
    AuthResource.Permission,
  ],
  [UserServiceUserType.TenantAdmin]: [
    AuthResource.User,
    AuthResource.Role,
    AuthResource.Permission,
  ],
  [UserServiceUserType.User]: [AuthResource.Order],
} as const;

/**
 * Basic permission interface
 *
 * Represents a simple permission with action, resource, and possession.
 */
export interface Permission {
  /** The action being performed */
  action: AuthActionVerb;

  /** The resource being accessed */
  resource: AuthResource;

  /** The possession level required */
  possession: AuthPossession;
}

/**
 * Execution context for RBAC permission evaluation
 *
 * Provides the necessary context information for permission checks.
 */
export interface RbacContext {
  /** Current user information */
  user: {
    id: string;
    tenantId?: string;
    organizationId?: string;
    roles?: string[];
  };

  /** Request context */
  request?: {
    params?: Record<string, unknown>;
    body?: Record<string, unknown>;
    query?: Record<string, unknown>;
  };

  /** Additional context data */
  [key: string]: unknown;
}

/**
 * Advanced RBAC permission with context resolution
 *
 * Extends basic permission with the ability to dynamically resolve
 * resources based on execution context.
 */
export interface RbacPermission {
  /** The action being performed */
  action: AuthActionVerb;

  /** The resource being accessed (can be dynamic) */
  resource: AuthResource | string | object;

  /** The possession level required */
  possession: AuthPossession;

  /**
   * Function to resolve resource from context
   * Allows dynamic resource resolution based on request context
   */
  resourceFromContext?: (ctx: RbacContext, perm: RbacPermission) => AuthResource | string | object;
}

/**
 * Metadata key for storing RBAC permissions
 *
 * Used by decorators and reflection to attach permission metadata
 * to controllers, methods, and other application components.
 */
export const RBAC_PERMISSIONS_KEY = 'rbac_permissions';

/**
 * Type guard to check if a value is a valid AuthResource
 */
export const isValidAuthResource = (value: string): value is AuthResource => {
  return Object.values(AuthResource).includes(value as AuthResource);
};

/**
 * Type guard to check if a value is a valid AuthActionVerb
 */
export const isValidAuthAction = (value: string): value is AuthActionVerb => {
  return Object.values(AuthActionVerb).includes(value as AuthActionVerb);
};

/**
 * Type guard to check if a value is a valid AuthPossession
 */
export const isValidAuthPossession = (value: string): value is AuthPossession => {
  return Object.values(AuthPossession).includes(value as AuthPossession);
};

/**
 * Utility to create a permission object
 */
export const createPermission = (
  action: AuthActionVerb,
  resource: AuthResource,
  possession: AuthPossession,
): Permission => {
  return { action, resource, possession };
};

/**
 * Utility to create an RBAC permission with optional context resolver
 */
export const createRbacPermission = (
  action: AuthActionVerb,
  resource: AuthResource | string | object,
  possession: AuthPossession,
  resourceFromContext?: RbacPermission['resourceFromContext'],
): RbacPermission => {
  return { action, resource, possession, resourceFromContext };
};
