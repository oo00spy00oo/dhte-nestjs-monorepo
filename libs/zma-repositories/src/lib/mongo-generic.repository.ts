/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model } from 'mongoose';

import { IGenericRepository } from '../abstracts';
import { QueryOptions } from '../abstracts/query-options.interface';

export class MongoGenericRepository<T> extends IGenericRepository<T> {
  protected repository: Model<T>;
  protected populateOnFind: string[];

  constructor(repository: Model<T>, populateOnFind: string[] = []) {
    super();
    this.repository = repository;
    this.populateOnFind = populateOnFind;
  }

  private async find(query: any, options: QueryOptions = {}): Promise<T[]> {
    const { limit = 10, skip = 0, sort } = options;
    return this.repository
      .find(query)
      .populate(this.populateOnFind)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();
  }

  async findMany({
    find,
    options,
  }: {
    find: { item?: Partial<T>; filter?: any };
    options?: QueryOptions;
  }): Promise<T[]> {
    return this.find(find.item || find.filter, options);
  }

  async findManyByIds({
    ids,
    options,
  }: {
    ids: (string | number)[];
    options?: QueryOptions;
  }): Promise<T[]> {
    return this.find({ _id: { $in: ids } }, options);
  }

  async findOne({ find = {} }: { find?: { item?: Partial<T>; filter?: any } }): Promise<T | null> {
    return this.repository
      .findOne(find.item || find.filter)
      .populate(this.populateOnFind)
      .exec();
  }

  async findAll({ params }: { params?: QueryOptions } = {}): Promise<T[]> {
    return this.find({}, params);
  }

  async findById({ id }: { id: string | number }): Promise<T | null> {
    return this.repository.findById(id).populate(this.populateOnFind).exec();
  }

  async create({ item }: { item: T }): Promise<T> {
    return this.repository.create(item);
  }

  async updateOne({
    id,
    update,
  }: {
    id: string | number;
    update: { item?: Partial<T>; operator?: any };
  }): Promise<T | null> {
    return this.repository
      .findByIdAndUpdate(id, update.item || update.operator, { new: true, runValidators: true })
      .exec();
  }

  async createOrUpdate({
    id,
    update,
  }: {
    id: string | number;
    update: { item?: Partial<T>; operator?: any };
  }): Promise<T> {
    return this.repository
      .findByIdAndUpdate(id, update.item || update.operator, {
        new: true,
        runValidators: true,
        upsert: true,
      })
      .exec();
  }

  async createMany({ items }: { items: T[] }): Promise<T[]> {
    return this.repository.insertMany(items);
  }

  async updateManyByIds({
    ids,
    update,
  }: {
    ids: (string | number)[];
    update: { item?: Partial<T>; operator?: any };
  }): Promise<{ modifiedCount: number }> {
    const { item, operator } = update;
    const { modifiedCount } = await this.repository
      .updateMany(
        { _id: { $in: ids } },
        { ...(item && operator ? { ...operator, ...item } : item || operator) },
      )
      .exec();
    return { modifiedCount };
  }

  async updateMany({
    filter,
    update,
  }: {
    filter?: any;
    update: { item?: Partial<T>; operator?: any };
  }): Promise<{ modifiedCount: number }> {
    const { item, operator } = update;
    const { modifiedCount } = await this.repository
      .updateMany(filter, { ...(item && operator ? { ...operator, ...item } : item || operator) })
      .exec();
    return { modifiedCount };
  }

  async aggregate({ pipeline }: { pipeline: any[] }): Promise<any[]> {
    return this.repository.aggregate(pipeline).exec();
  }
}
