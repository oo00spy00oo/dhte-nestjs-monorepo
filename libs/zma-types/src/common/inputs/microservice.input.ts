interface Pagination {
  limit: number;
  skip: number;
}

type Sort = 'asc' | 'desc';

/**
 * @example
 * // Define a type for the data
 * interface UserData {
 *   id: number;
 *   name: string;
 * }
 *
 * // Create an instance of MicroserviceInput
 * const userRequest = new MicroserviceInput<UserData>({
 *   requestId: "req-001",
 *   pagination: { limit: 10, skip: 0 },
 *   sort: 'asc',
 *   tenantId: "tenant-123",
 *   data: { id: 1, name: "John Doe" },
 * });
 *
 * // Convert to JSON for transmission
 * const jsonRequest = userRequest.toJSON();
 * console.log(jsonRequest);
 *
 * // Output:
 * {
 *   "requestId": "req-001",
 *   "pagination": {
 *     "limit": 10,
 *     "skip": 0
 *   },
 *   "sort": "asc",
 *   "tenantId": "tenant-123",
 *   "data": {
 *     "id": 1,
 *     "name": "John Doe"
 *   }
 * }
 */
export class MicroserviceInput<T> {
  requestId: string;
  pagination?: Pagination;
  sort?: Sort;
  sortBy?: string;
  tenantId?: string;
  data: T;

  constructor({
    requestId,
    pagination,
    sort,
    sortBy,
    tenantId,
    data,
  }: {
    requestId: string;
    pagination?: Pagination;
    sort?: Sort;
    sortBy?: string;
    tenantId?: string;
    data: T;
  }) {
    this.requestId = requestId;
    this.pagination = pagination;
    this.sort = sort;
    this.sortBy = sortBy;
    this.tenantId = tenantId;
    this.data = data;
  }

  toJSON(): object {
    return {
      requestId: this.requestId,
      pagination: this.pagination,
      sort: this.sort,
      sortBy: this.sortBy,
      tenantId: this.tenantId,
      data: this.data,
    };
  }
}
