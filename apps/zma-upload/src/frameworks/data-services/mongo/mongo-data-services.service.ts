import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ITenantGenericRepository,
  TenantMongoGenericRepository,
} from '@zma-nestjs-monorepo/zma-repositories';
import { Model } from 'mongoose';

import { IDataServices } from '../../../core';

import { CompanyDocument, CompanyEntity } from './entities';

@Injectable()
export class MongoDataServices implements IDataServices, OnApplicationBootstrap {
  companyService: ITenantGenericRepository<CompanyEntity>;

  constructor(
    @InjectModel(CompanyEntity.name)
    private companyRepository: Model<CompanyDocument>,
  ) {}

  onApplicationBootstrap() {
    this.companyService = new TenantMongoGenericRepository(this.companyRepository);
  }
}
