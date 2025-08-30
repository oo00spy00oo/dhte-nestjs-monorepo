/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field, InputType } from '@nestjs/graphql';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

/**
 * Base input for operations requiring tenant context
 *
 * Provides tenant isolation for multi-tenant operations.
 * All tenant-aware operations should extend or include this input.
 */
@InputType()
export abstract class TenantAwareInput {
  /**
   * Tenant identifier for multi-tenant isolation
   * Required for all tenant-scoped operations
   */
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Tenant identifier for multi-tenant isolation' })
  tenantId!: string;
}

/**
 * Input for finding entities by multiple IDs
 *
 * Provides batch lookup functionality with tenant isolation.
 * Useful for bulk operations and data fetching optimizations.
 */
@InputType()
export class FindByMultipleIdsGqlInput extends TenantAwareInput {
  /**
   * Array of entity IDs to find
   * Limited to prevent excessive queries and ensure performance
   */
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one ID must be provided' })
  @ArrayMaxSize(100, { message: 'Maximum 100 IDs allowed per request' })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @Field(() => [String], {
    description: 'Array of entity IDs to find (max 100)',
  })
  ids!: string[];
}

/**
 * Input for finding a single entity by ID
 *
 * Standard input for single entity lookup operations.
 * Includes tenant context for proper isolation.
 */
@InputType()
export class FindByIdGqlInput extends TenantAwareInput {
  /**
   * Unique identifier of the entity to find
   */
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Unique identifier of the entity' })
  id!: string;
}

/**
 * Input for finding entities by user ID
 *
 * Used for user-scoped queries across different services.
 * Automatically includes user context for filtering.
 */
@InputType()
export class FindByUserIdGqlInput {
  /**
   * User identifier for user-scoped operations
   */
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'User identifier for user-scoped operations' })
  userId!: string;
}

/**
 * Input for finding entities by organization ID
 *
 * Used for organization-scoped queries within a tenant.
 * Provides organizational context for hierarchical data.
 */
@InputType()
export class FindByOrganizationIdGqlInput {
  /**
   * Organization identifier for organization-scoped operations
   */
  @IsString()
  @IsNotEmpty()
  @Field(() => String, {
    description: 'Organization identifier for organization-scoped operations',
  })
  organizationId!: string;
}

/**
 * Enhanced input combining ID and user context
 *
 * Useful for operations that need both entity identification
 * and user context (e.g., permission checks, audit trails).
 */
@InputType()
export class FindByIdAndUserIdInput extends FindByIdGqlInput {
  /**
   * User identifier for additional context
   */
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'User identifier for additional context' })
  userId!: string;
}

/**
 * Enhanced input for multiple IDs with user context
 *
 * Combines batch operations with user context for scenarios
 * where user permissions or ownership need to be verified.
 */
@InputType()
export class FindByMultipleIdsAndUserIdInput extends FindByMultipleIdsGqlInput {
  /**
   * User identifier for additional context and permissions
   */
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'User identifier for additional context and permissions' })
  userId!: string;
}

/**
 * Input for tenant and organization scoped operations
 *
 * Provides complete hierarchical context with tenant and organization.
 * Used for operations that need full organizational context.
 */
@InputType()
export class TenantOrganizationScopedInput extends TenantAwareInput {
  /**
   * Organization identifier within the tenant
   */
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Organization identifier within the tenant' })
  organizationId!: string;
}

/**
 * Input for user-specific operations within tenant context
 *
 * Combines user identification with tenant isolation.
 * Common pattern for user-centric operations.
 */
@InputType()
export class TenantUserScopedInput extends TenantAwareInput {
  /**
   * User identifier within the tenant
   */
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'User identifier within the tenant' })
  userId!: string;
}

// Legacy compatibility exports
// These maintain backward compatibility while encouraging use of the new types
export class FindByIdInput extends FindByIdGqlInput {}
export class FindByMultipleIdsInput extends FindByMultipleIdsGqlInput {}
export class FindByUserIdInput extends FindByUserIdGqlInput {}
export class FindByOrganizationIdInput extends FindByOrganizationIdGqlInput {}

/**
 * Type guards for input validation
 */

/**
 * Check if input includes tenant context
 */
export const hasTenantContext = (input: any): input is TenantAwareInput => {
  return input && typeof input.tenantId === 'string' && input.tenantId.length > 0;
};

/**
 * Check if input includes user context
 */
export const hasUserContext = (input: any): input is { userId: string } => {
  return input && typeof input.userId === 'string' && input.userId.length > 0;
};

/**
 * Check if input includes organization context
 */
export const hasOrganizationContext = (input: any): input is { organizationId: string } => {
  return input && typeof input.organizationId === 'string' && input.organizationId.length > 0;
};

/**
 * Validate that IDs array is not empty and within limits
 */
export const validateIdsArray = (ids: string[]): boolean => {
  return (
    Array.isArray(ids) &&
    ids.length > 0 &&
    ids.length <= 100 &&
    ids.every((id) => typeof id === 'string' && id.length > 0)
  );
};
