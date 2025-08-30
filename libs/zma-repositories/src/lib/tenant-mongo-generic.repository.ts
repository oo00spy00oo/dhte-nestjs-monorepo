/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model } from 'mongoose';

import { QueryOptions } from '../abstracts/query-options.interface';
import { ITenantGenericRepository } from '../abstracts/tenant-generic-repository.abstract';

export class TenantMongoGenericRepository<T> implements ITenantGenericRepository<T> {
  protected repository: Model<T>;
  protected populateOnFind: string[];

  constructor(repository: Model<T>, populateOnFind: string[] = []) {
    this.repository = repository;
    this.populateOnFind = populateOnFind;
  }

  private async find(tenantId: string, query: any, options?: QueryOptions): Promise<T[]> {
    const { limit = 10, skip = 0, sort } = options || {};
    return tenantId
      ? this.repository
          .find({ ...query, tenantId })
          .populate(this.populateOnFind)
          .limit(limit)
          .skip(skip)
          .sort(sort)
          .exec()
      : this.repository
          .find({ ...query })
          .populate(this.populateOnFind)
          .limit(limit)
          .skip(skip)
          .sort(sort)
          .exec();
  }

  async findMany({
    tenantId,
    find,
    options,
  }: {
    tenantId: string;
    find: { item?: Partial<T>; filter?: any };
    options?: QueryOptions;
  }): Promise<T[]> {
    return this.find(tenantId, find.item || find.filter, options);
  }

  async findManyByIds({
    tenantId,
    ids,
    options,
  }: {
    tenantId: string;
    ids: (string | number)[];
    options?: QueryOptions;
  }): Promise<T[]> {
    return this.find(tenantId, { _id: { $in: ids } }, options);
  }

  async findAll({ tenantId, params }: { tenantId: string; params?: QueryOptions }): Promise<T[]> {
    return this.find(tenantId, {}, params);
  }

  async findOne({
    tenantId,
    find,
  }: {
    tenantId: string;
    find?: { item?: Partial<T>; filter?: any };
  }): Promise<T | null> {
    return tenantId
      ? this.repository
          .findOne({ ...(find?.item || find?.filter), tenantId })
          .populate(this.populateOnFind)
          .exec()
      : this.repository
          .findOne({ ...(find?.item || find?.filter) })
          .populate(this.populateOnFind)
          .exec();
  }

  async findById({ tenantId, id }: { tenantId: string; id: string | number }): Promise<T | null> {
    return tenantId
      ? this.repository.findOne({ _id: id, tenantId }).populate(this.populateOnFind).exec()
      : this.repository.findOne({ _id: id }).populate(this.populateOnFind).exec();
  }

  async create({ tenantId, item }: { tenantId: string; item: T }): Promise<T> {
    return tenantId
      ? this.repository.create({ ...item, tenantId })
      : this.repository.create({ ...item });
  }

  async createMany({ tenantId, items }: { tenantId: string; items: T[] }): Promise<T[]> {
    const itemsWithTenant = tenantId
      ? items.map((item) => ({ ...item, tenantId }))
      : items.map((item) => ({ ...item }));
    return this.repository.insertMany(itemsWithTenant);
  }

  async updateOne({
    tenantId,
    id,
    update,
    options,
  }: {
    tenantId: string;
    id: string | number;
    update: { item?: Partial<T>; operator?: any };
    options?: QueryOptions;
  }): Promise<T | null> {
    return tenantId
      ? this.repository
          .findOneAndUpdate({ _id: id, tenantId }, update.item || update.operator, {
            ...options,
            new: true,
            runValidators: true,
          })
          .exec()
      : this.repository
          .findOneAndUpdate({ _id: id }, update.item || update.operator, {
            ...options,
            new: true,
            runValidators: true,
          })
          .exec();
  }

  async createOrUpdate({
    tenantId,
    id,
    update,
  }: {
    tenantId: string;
    id: string | number;
    update: { item?: Partial<T>; operator?: any };
  }): Promise<T> {
    return tenantId
      ? this.repository
          .findOneAndUpdate({ _id: id, tenantId }, update.item || update.operator, {
            new: true,
            runValidators: true,
            upsert: true,
          })
          .exec()
      : this.repository
          .findOneAndUpdate({ _id: id }, update.item || update.operator, {
            new: true,
            runValidators: true,
            upsert: true,
          })
          .exec();
  }

  async updateManyByIds({
    tenantId,
    ids,
    update,
  }: {
    tenantId: string;
    ids: (string | number)[];
    update: { item?: Partial<T>; operator?: any };
  }): Promise<{ modifiedCount: number }> {
    const { item, operator } = update;
    const { modifiedCount } = tenantId
      ? await this.repository
          .updateMany(
            { _id: { $in: ids }, tenantId },
            { ...(item && operator ? { ...operator, ...item } : item || operator) },
          )
          .exec()
      : await this.repository
          .updateMany(
            { _id: { $in: ids } },
            { ...(item && operator ? { ...operator, ...item } : item || operator) },
          )
          .exec();
    return { modifiedCount };
  }

  async updateMany({
    tenantId,
    filter,
    update,
  }: {
    tenantId: string;
    filter?: any;
    update: { item?: Partial<T>; operator?: any; operators?: any[] };
  }): Promise<{ modifiedCount: number }> {
    const { item, operator, operators } = update;
    const queryFilter = tenantId ? { ...filter, tenantId } : { ...filter };
    const updateData = item && operator ? { ...operator, ...item } : item || operator;

    if (operators && operators.length > 0) {
      const { modifiedCount } = await this.repository.updateMany(queryFilter, operators).exec();
      return { modifiedCount };
    }

    const { modifiedCount } = await this.repository.updateMany(queryFilter, updateData).exec();
    return { modifiedCount };
  }

  async aggregate({ pipeline }: { pipeline: any[] }): Promise<any[]> {
    return this.repository.aggregate(pipeline).exec();
  }
}
