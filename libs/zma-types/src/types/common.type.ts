/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Common utility types and interfaces used throughout the application
 *
 * This module provides foundational types that are used across multiple domains.
 * These types help ensure consistency and type safety in data transformations
 * and API contracts.
 */

/**
 * Mapper direction enumeration for data transformation patterns
 *
 * Used to specify the direction of data transformation in mapper functions.
 * Enables type-safe bidirectional data mapping between different representations.
 *
 * @enum {string}
 */
export enum KeyMapper {
  /** Input transformation (external to internal format) */
  Input = 'input',

  /** Output transformation (internal to external format) */
  Output = 'output',
}

/**
 * Base entity interface with common fields
 *
 * Provides a consistent structure for entities that include
 * standard fields like id, creation time, and update time.
 */
export interface BaseEntity {
  /** Unique identifier */
  _id?: string;

  /** Entity creation timestamp */
  createdAt?: Date;

  /** Entity last update timestamp */
  updatedAt?: Date;

  /** Soft delete timestamp (if applicable) */
  deletedAt?: Date | null;
}

/**
 * Tenant-aware entity interface
 *
 * Extends BaseEntity to include tenant isolation fields.
 * Used for multi-tenant entities that need tenant-specific data separation.
 */
export interface TenantAwareEntity extends BaseEntity {
  /** Tenant identifier for multi-tenant isolation */
  tenantId: string;

  /** Organization identifier within the tenant */
  organizationId?: string;
}

/**
 * Audit trail interface for tracking entity changes
 *
 * Provides fields for tracking who created and modified an entity.
 * Essential for compliance and audit requirements.
 */
export interface AuditableEntity extends BaseEntity {
  /** User ID who created the entity */
  createdBy?: string;

  /** User ID who last updated the entity */
  updatedBy?: string;
}

/**
 * Complete entity interface combining all common patterns
 *
 * Provides a comprehensive base for entities that need tenant isolation,
 * audit trails, and standard entity fields.
 */
export interface CompleteEntity extends TenantAwareEntity, AuditableEntity {}

/**
 * Pagination query parameters interface
 *
 * Standard interface for paginated query parameters used across all services.
 */
export interface PaginationParams {
  /** Number of items to skip */
  skip?: number;

  /** Maximum number of items to return */
  limit?: number;

  /** Sort field and direction */
  sort?: Record<string, 1 | -1>;
}

/**
 * Paginated response interface
 *
 * Standard response structure for paginated data across all services.
 * Provides consistent pagination metadata.
 */
export interface PaginatedResult<T = any> {
  /** Array of items for current page */
  items: T[];

  /** Total number of items across all pages */
  total: number;

  /** Number of items in current page */
  count: number;

  /** Current page number (0-based) */
  page?: number;

  /** Number of items per page */
  limit?: number;

  /** Whether there are more pages available */
  hasMore?: boolean;
}

/**
 * Generic API response wrapper
 *
 * Standard response structure for all API endpoints.
 * Provides consistent success/error handling and metadata.
 */
export interface ApiResponse<T = any> {
  /** Response data */
  data?: T;

  /** Success indicator */
  success: boolean;

  /** Error message (if any) */
  message?: string;

  /** Additional error details */
  errors?: string[];

  /** Response timestamp */
  timestamp?: Date;

  /** Request correlation ID for tracing */
  correlationId?: string;
}

/**
 * Type utility for making specific fields optional
 *
 * Useful for update operations where not all fields are required.
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Type utility for excluding null and undefined values
 *
 * Helpful for type narrowing in scenarios where values are guaranteed to exist.
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Strict string literal type that excludes empty strings
 *
 * Ensures string values are non-empty at the type level.
 */
export type NonEmptyString = string & { readonly __brand: unique symbol };

/**
 * Type guard to check if a string is non-empty
 * @param value - String value to check
 * @returns True if string is non-empty
 */
export const isNonEmptyString = (value: string): value is NonEmptyString => {
  return value.trim().length > 0;
};
