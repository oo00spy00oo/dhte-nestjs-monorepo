/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryOptions } from './query-options.interface';

export abstract class ITenantGenericRepository<T> {
  abstract findById({
    tenantId,
    id,
  }: {
    tenantId?: string;
    id: string | number;
  }): Promise<T | null>;

  abstract findOne({
    tenantId,
    find,
  }: {
    tenantId: string;
    find?: { item?: Partial<T>; filter?: any };
  }): Promise<T | null>;

  abstract create({ tenantId, item }: { tenantId: string; item: T }): Promise<T>;

  abstract createMany({ tenantId, items }: { tenantId: string; items: T[] }): Promise<T[]>;

  abstract findAll({ tenantId, params }: { tenantId: string; params?: QueryOptions }): Promise<T[]>;

  abstract findManyByIds({
    tenantId,
    ids,
    options,
  }: {
    tenantId: string;
    ids: (string | number)[];
    options?: QueryOptions;
  }): Promise<T[]>;

  abstract findMany({
    tenantId,
    find,
    options,
  }: {
    tenantId: string;
    find: {
      item?: Partial<T>;
      filter?: any;
    };
    options?: QueryOptions;
  }): Promise<T[]>;

  abstract updateOne({
    tenantId,
    id,
    update,
    options,
  }: {
    tenantId: string;
    id: string | number;
    update: { item?: Partial<T>; operator?: any };
    options?: QueryOptions;
  }): Promise<T | null>;

  abstract createOrUpdate({
    tenantId,
    id,
    update,
  }: {
    tenantId: string;
    id: string | number;
    update: { item?: Partial<T>; operator?: any };
  }): Promise<T>;

  abstract updateManyByIds({
    tenantId,
    ids,
    update,
  }: {
    tenantId: string;
    ids: (string | number)[];
    update: { item?: Partial<T>; operator?: any };
  }): Promise<{ modifiedCount: number }>;

  abstract updateMany({
    tenantId,
    filter,
    update,
  }: {
    tenantId: string;
    filter?: any;
    update: { item?: Partial<T>; operator?: any; operators?: any[] };
  }): Promise<{ modifiedCount: number }>;

  abstract aggregate({ pipeline }: { pipeline: any[] }): Promise<any[]>;
}
