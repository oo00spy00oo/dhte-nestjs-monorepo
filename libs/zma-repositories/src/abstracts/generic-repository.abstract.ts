/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryOptions } from './query-options.interface';

export abstract class IGenericRepository<T> {
  abstract findById({ id }: { id: string | number }): Promise<T | null>;

  abstract findOne({ find }: { find?: { item?: Partial<T>; filter?: any } }): Promise<T | null>;

  abstract create({ item }: { item: T }): Promise<T>;

  abstract findAll({ params }: { params?: QueryOptions }): Promise<T[]>;

  abstract findManyByIds({
    ids,
    options,
  }: {
    ids: (string | number)[];
    options?: QueryOptions;
  }): Promise<T[]>;

  abstract findMany({
    find,
    options,
  }: {
    find: {
      item?: Partial<T>;
      filter?: any;
    };
    options?: QueryOptions;
  }): Promise<T[]>;

  abstract updateOne({
    id,
    update,
  }: {
    id: string | number;
    update: { item?: Partial<T>; operator?: any };
  }): Promise<T | null>;

  abstract createOrUpdate({
    id,
    update,
  }: {
    id: string | number;
    update: { item?: Partial<T>; operator?: any };
  }): Promise<T>;

  abstract updateManyByIds({
    ids,
    update,
  }: {
    ids: (string | number)[];
    update: { item?: Partial<T>; operator?: any };
  }): Promise<{ modifiedCount: number }>;

  abstract updateMany({
    filter,
    update,
  }: {
    filter?: any;
    update: { item?: Partial<T>; operator?: any };
  }): Promise<{ modifiedCount: number }>;

  abstract createMany({ items }: { items: T[] }): Promise<T[]>;

  abstract aggregate({ pipeline }: { pipeline: any[] }): Promise<any[]>;
}
