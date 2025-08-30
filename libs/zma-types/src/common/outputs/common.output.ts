/* eslint-disable @typescript-eslint/no-explicit-any */
import { Type as ClassType } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';

/**
 * Standard boolean response output
 *
 * Used for operations that return simple success/failure status.
 * Provides consistent structure for boolean responses across all services.
 */
@ObjectType()
export class BooleanGqlOutput {
  /**
   * Operation status indicator
   * True indicates successful operation, false indicates failure
   */
  @Field(() => Boolean, { description: 'Operation status (success/failure)' })
  status!: boolean;

  /**
   * Optional message providing additional context
   * Useful for providing user-friendly feedback
   */
  @Field(() => String, { nullable: true, description: 'Optional status message' })
  message?: string;

  /**
   * Timestamp when the operation was completed
   */
  @Field(() => Date, { nullable: true, description: 'Operation completion timestamp' })
  timestamp?: Date;
}

// Legacy compatibility export
export class BooleanOutput extends BooleanGqlOutput {}

/**
 * Page information for pagination responses
 *
 * Provides comprehensive pagination metadata following Relay specification.
 */
@ObjectType('PageInfo')
export class PageInfo {
  /**
   * Whether there are more items available after the current page
   */
  @Field(() => Boolean, { description: 'Whether there are more items after current page' })
  hasNextPage!: boolean;

  /**
   * Whether there are items available before the current page
   */
  @Field(() => Boolean, { description: 'Whether there are items before current page' })
  hasPreviousPage!: boolean;

  /**
   * Cursor pointing to the first item in the current page
   */
  @Field(() => String, { nullable: true, description: 'Cursor for the first item in current page' })
  startCursor?: string;

  /**
   * Cursor pointing to the last item in the current page
   */
  @Field(() => String, { nullable: true, description: 'Cursor for the last item in current page' })
  endCursor?: string;
}

/**
 * Enhanced pagination metadata
 *
 * Extends basic page info with additional metadata useful for UI components.
 */
@ObjectType('PaginationMeta')
export class PaginationMeta extends PageInfo {
  /**
   * Total number of items across all pages
   */
  @Field(() => Int, { description: 'Total number of items across all pages' })
  totalCount!: number;

  /**
   * Number of items in the current page
   */
  @Field(() => Int, { description: 'Number of items in current page' })
  count!: number;

  /**
   * Current page number (1-based)
   */
  @Field(() => Int, { nullable: true, description: 'Current page number (1-based)' })
  currentPage?: number;

  /**
   * Total number of pages
   */
  @Field(() => Int, { nullable: true, description: 'Total number of pages' })
  totalPages?: number;

  /**
   * Number of items per page
   */
  @Field(() => Int, { nullable: true, description: 'Number of items per page' })
  pageSize?: number;
}

/**
 * Generic paginated response factory function
 *
 * Creates a paginated response type for any entity type.
 * Provides consistent pagination structure across all services.
 *
 * @param TClass - The entity class to paginate
 * @returns Paginated response class for the entity
 */
export function PaginatedResponse<T>(TClass: ClassType<T>) {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedResponseClass {
    /**
     * Array of items for the current page
     */
    @Field(() => [TClass], { description: 'Items for the current page' })
    items!: T[];

    /**
     * Pagination metadata
     */
    @Field(() => PaginationMeta, { description: 'Pagination metadata' })
    pageInfo!: PaginationMeta;

    /**
     * Response timestamp
     */
    @Field(() => Date, { description: 'Response generation timestamp' })
    timestamp!: Date;
  }

  return PaginatedResponseClass;
}

/**
 * Legacy compatibility - enhanced FindManyOutput with better metadata
 *
 * @deprecated Use PaginatedResponse instead for new implementations
 */
export function FindManyOutput<T>(TClass: ClassType<T>) {
  @ObjectType({ isAbstract: true })
  abstract class FindManyOutputClass {
    /**
     * Array of found items
     */
    @Field(() => [TClass], { description: 'Array of found items' })
    data!: T[];

    /**
     * Total number of items (for pagination)
     */
    @Field(() => Int, { description: 'Total number of items' })
    total!: number;

    // /**
    //  * Number of items in current response
    //  */
    // @Field(() => Int, { description: 'Number of items in current response' })
    // count!: number;

    // /**
    //  * Whether there are more items available
    //  */
    // @Field(() => Boolean, { description: 'Whether there are more items available' })
    // hasMore!: boolean;
  }

  return FindManyOutputClass;
}

/**
 * Cursor-based connection response following Relay specification
 *
 * Provides cursor-based pagination for efficient large dataset handling.
 */
export function Connection<T>(TClass: ClassType<T>) {
  @ObjectType({ isAbstract: true })
  abstract class Edge {
    /**
     * The item at this edge
     */
    @Field(() => TClass, { description: 'The item at this edge' })
    node!: T;

    /**
     * Cursor for this edge
     */
    @Field(() => String, { description: 'Cursor identifying this edge' })
    cursor!: string;
  }

  @ObjectType({ isAbstract: true })
  abstract class ConnectionClass {
    /**
     * Array of edges containing items and cursors
     */
    @Field(() => [Edge], { description: 'Array of edges' })
    edges!: Edge[];

    /**
     * Page information for cursor-based pagination
     */
    @Field(() => PageInfo, { description: 'Page information' })
    pageInfo!: PageInfo;

    /**
     * Total count of items (expensive to compute, use sparingly)
     */
    @Field(() => Int, { nullable: true, description: 'Total count of items' })
    totalCount?: number;
  }

  return { Connection: ConnectionClass, Edge };
}

/**
 * Mutation response wrapper for consistent mutation results
 *
 * Provides standard structure for mutation responses with success indicators.
 */
export function MutationResponse<T>(TClass: ClassType<T>, operationName: string) {
  @ObjectType({ isAbstract: true })
  abstract class MutationResponseClass {
    /**
     * Whether the mutation was successful
     */
    @Field(() => Boolean, { description: `Whether the ${operationName} was successful` })
    success!: boolean;

    /**
     * The created/updated entity (if successful)
     */
    @Field(() => TClass, { nullable: true, description: `The ${operationName} result` })
    data?: T;

    /**
     * Error message (if unsuccessful)
     */
    @Field(() => String, { nullable: true, description: 'Error message if unsuccessful' })
    message?: string;

    /**
     * Additional error details
     */
    @Field(() => [String], { nullable: true, description: 'Additional error details' })
    errors?: string[];

    /**
     * Operation timestamp
     */
    @Field(() => Date, { description: 'Operation timestamp' })
    timestamp!: Date;
  }

  return MutationResponseClass;
}

/**
 * Batch operation response for bulk operations
 *
 * Provides results for operations that affect multiple items.
 */
@ObjectType('BatchOperationResponse')
export class BatchOperationResponse {
  /**
   * Number of items successfully processed
   */
  @Field(() => Int, { description: 'Number of items successfully processed' })
  successCount!: number;

  /**
   * Number of items that failed processing
   */
  @Field(() => Int, { description: 'Number of items that failed processing' })
  failureCount!: number;

  /**
   * Total number of items attempted
   */
  @Field(() => Int, { description: 'Total number of items attempted' })
  totalCount!: number;

  /**
   * Array of error messages for failed items
   */
  @Field(() => [String], { nullable: true, description: 'Error messages for failed items' })
  errors?: string[];

  /**
   * Operation completion timestamp
   */
  @Field(() => Date, { description: 'Operation completion timestamp' })
  timestamp!: Date;
}

/**
 * Helper function to create standard pagination metadata
 */
export const createPaginationMeta = (
  items: any[],
  total: number,
  skip = 0,
  limit = 10,
): PaginationMeta => {
  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = skip + limit < total;
  const hasPreviousPage = skip > 0;

  return {
    totalCount: total,
    count: items.length,
    currentPage,
    totalPages,
    pageSize: limit,
    hasNextPage,
    hasPreviousPage,
    startCursor: items.length > 0 ? Buffer.from('0').toString('base64') : undefined,
    endCursor:
      items.length > 0 ? Buffer.from((items.length - 1).toString()).toString('base64') : undefined,
  };
};

/**
 * Helper function to create cursor-based page info
 */
export const createPageInfo = (
  edges: any[],
  hasNextPage: boolean,
  hasPreviousPage: boolean,
): PageInfo => {
  return {
    hasNextPage,
    hasPreviousPage,
    startCursor: edges.length > 0 ? edges[0].cursor : undefined,
    endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
  };
};
