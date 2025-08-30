import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IGenericRepository, MongoGenericRepository } from '@zma-nestjs-monorepo/zma-repositories';
import { Model } from 'mongoose';

import { IDataServices } from '../../../core';

import { DictionaryDocument, DictionaryEntity } from './entities';

@Injectable()
export class MongoDataServices implements IDataServices, OnApplicationBootstrap {
  dictionaryService: IGenericRepository<DictionaryEntity>;

  constructor(
    @InjectModel(DictionaryEntity.name)
    private dictionaryRepository: Model<DictionaryDocument>,
  ) {}

  onApplicationBootstrap() {
    this.dictionaryService = new MongoGenericRepository(this.dictionaryRepository);
  }
}
