import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

/**
 * Sort direction enumeration for ordering query results
 *
 * @enum {string}
 */
export enum SortDirection {
  /** Ascending order (A-Z, 0-9, oldest first) */
  ASC = 'ASC',

  /** Descending order (Z-A, 9-0, newest first) */
  DESC = 'DESC',
}

registerEnumType(SortDirection, {
  name: 'SortDirection',
  description: 'Sort direction for ordering query results',
});

/**
 * Sort field configuration for complex sorting
 */
@InputType('SortField')
export class SortField {
  /** Field name to sort by */
  @IsString()
  @Field(() => String, { description: 'Field name to sort by' })
  field!: string;

  /** Sort direction for this field */
  @IsEnum(SortDirection)
  @Field(() => SortDirection, {
    description: 'Sort direction for this field',
    defaultValue: SortDirection.ASC,
  })
  direction: SortDirection = SortDirection.ASC;
}

/**
 * Enhanced pagination input with advanced sorting and filtering capabilities
 *
 * Provides comprehensive pagination, sorting, and basic filtering options
 * for consistent query patterns across all GraphQL endpoints.
 */
@InputType('Pagination')
export class Pagination {
  /**
   * Number of items to skip (offset)
   * Useful for implementing pagination with page numbers
   */
  @IsInt()
  @IsOptional()
  @Min(0, { message: 'Skip must be non-negative' })
  @Max(10000, { message: 'Skip cannot exceed 10,000 items' })
  @Field(() => Int, {
    nullable: true,
    description: 'Number of items to skip (offset)',
    defaultValue: 0,
  })
  skip?: number = 0;

  /**
   * Maximum number of items to return
   * Helps prevent excessive data transfer and performance issues
   */
  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100 items' })
  @Field(() => Int, {
    nullable: true,
    description: 'Maximum number of items to return (1-100)',
    defaultValue: 10,
  })
  limit?: number = 10;

  /**
   * Multiple sort fields for complex sorting
   * Allows sorting by multiple fields with different directions
   */
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SortField)
  @Field(() => [SortField], {
    nullable: true,
    description: 'Multiple sort fields for complex sorting',
  })
  sort?: SortField[];
}

/**
 * Cursor-based pagination input for large datasets
 *
 * Provides more efficient pagination for large datasets using cursors
 * instead of offset-based pagination.
 */
@InputType('CursorPagination')
export class CursorPagination {
  /**
   * Cursor for the starting position
   * Points to the last item from the previous page
   */
  @IsOptional()
  @IsString()
  @Field(() => String, {
    nullable: true,
    description: 'Cursor for the starting position',
  })
  after?: string;

  /**
   * Cursor for the ending position
   * Points to the first item from the next page
   */
  @IsOptional()
  @IsString()
  @Field(() => String, {
    nullable: true,
    description: 'Cursor for the ending position',
  })
  before?: string;

  /**
   * Number of items to return after the cursor
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Field(() => Int, {
    nullable: true,
    description: 'Number of items to return after the cursor',
    defaultValue: 10,
  })
  first?: number;

  /**
   * Number of items to return before the cursor
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Field(() => Int, {
    nullable: true,
    description: 'Number of items to return before the cursor',
  })
  last?: number;
}

/**
 * Date range filter for time-based filtering
 */
@InputType('DateRange')
export class DateRange {
  /** Start date (inclusive) */
  @IsOptional()
  @Field(() => Date, {
    nullable: true,
    description: 'Start date (inclusive)',
  })
  from?: Date;

  /** End date (inclusive) */
  @IsOptional()
  @Field(() => Date, {
    nullable: true,
    description: 'End date (inclusive)',
  })
  to?: Date;
}

/**
 * Common filter input for basic filtering operations
 */
@InputType('CommonFilter')
export class CommonFilter {
  /** Date range filter for createdAt field */
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRange)
  @Field(() => DateRange, {
    nullable: true,
    description: 'Filter by creation date range',
  })
  createdAt?: DateRange;

  /** Date range filter for updatedAt field */
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRange)
  @Field(() => DateRange, {
    nullable: true,
    description: 'Filter by update date range',
  })
  updatedAt?: DateRange;

  /** Filter by tenant ID */
  @IsOptional()
  @IsString()
  @Field(() => String, {
    nullable: true,
    description: 'Filter by tenant ID',
  })
  tenantId?: string;

  /** Filter by organization ID */
  @IsOptional()
  @IsString()
  @Field(() => String, {
    nullable: true,
    description: 'Filter by organization ID',
  })
  organizationId?: string;
}

/**
 * Type guard to check if pagination uses cursor-based pagination
 */
export const isCursorPagination = (pagination: any): pagination is CursorPagination => {
  return Boolean(
    pagination && (pagination.after || pagination.before || pagination.first || pagination.last),
  );
};

/**
 * Type guard to check if pagination uses offset-based pagination
 */
export const isOffsetPagination = (pagination: any): pagination is Pagination => {
  return Boolean(pagination && (pagination.skip !== undefined || pagination.limit !== undefined));
};

/**
 * Convert offset-based pagination to cursor-based pagination
 * @param pagination - Offset-based pagination
 * @param totalCount - Total number of items
 * @returns Cursor-based pagination equivalent
 */
export const offsetToCursor = (pagination: Pagination, totalCount: number): CursorPagination => {
  const skip = pagination.skip || 0;
  const limit = pagination.limit || 10;

  return {
    first: limit,
    after: skip > 0 ? Buffer.from(skip.toString()).toString('base64') : undefined,
  };
};

/**
 * Convert cursor-based pagination to offset-based pagination
 * @param pagination - Cursor-based pagination
 * @returns Offset-based pagination equivalent
 */
export const cursorToOffset = (pagination: CursorPagination): Pagination => {
  let skip = 0;

  if (pagination.after) {
    try {
      skip = parseInt(Buffer.from(pagination.after, 'base64').toString()) + 1;
    } catch {
      skip = 0;
    }
  }

  return {
    skip,
    limit: pagination.first || pagination.last || 10,
  };
};
