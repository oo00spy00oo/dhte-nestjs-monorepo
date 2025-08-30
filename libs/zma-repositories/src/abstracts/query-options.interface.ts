/* eslint-disable @typescript-eslint/no-explicit-any */
export interface QueryOptions {
  limit?: number;
  skip?: number;
  sort?: any;
  arrayFilters?: { [key: string]: any }[];
}
