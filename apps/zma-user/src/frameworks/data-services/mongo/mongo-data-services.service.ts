import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  IGenericRepository,
  ITenantGenericRepository,
  MongoGenericRepository,
  TenantMongoGenericRepository,
} from '@zma-nestjs-monorepo/zma-repositories';
import { Model } from 'mongoose';

import { IDataServices } from '../../../core';

import { TenantDocument, TenantEntity, UserDocument, UserEntity } from './entities';

@Injectable()
export class MongoDataServices implements IDataServices, OnApplicationBootstrap {
  userService: ITenantGenericRepository<UserEntity>;
  tenantService: IGenericRepository<TenantEntity>;

  constructor(
    @InjectModel(UserEntity.name)
    private userRepository: Model<UserDocument>,
    @InjectModel(TenantEntity.name)
    private tenantRepository: Model<TenantDocument>,
  ) {}

  onApplicationBootstrap() {
    this.userService = new TenantMongoGenericRepository(this.userRepository);
    this.tenantService = new MongoGenericRepository(this.tenantRepository);
  }
}
