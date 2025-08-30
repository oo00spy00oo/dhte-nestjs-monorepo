import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ITenantGenericRepository,
  TenantMongoGenericRepository,
} from '@zma-nestjs-monorepo/zma-repositories';
import { Model } from 'mongoose';

import { IDataServices } from '../../../core';

import { FileMetaDataDocument, FileMetaDataEntity } from './entities';

@Injectable()
export class MongoDataServices implements IDataServices, OnApplicationBootstrap {
  fileService: ITenantGenericRepository<FileMetaDataEntity>;

  constructor(
    @InjectModel(FileMetaDataEntity.name)
    private fileRepository: Model<FileMetaDataDocument>,
  ) {}

  onApplicationBootstrap() {
    this.fileService = new TenantMongoGenericRepository(this.fileRepository);
  }
}
