import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ITenantGenericRepository,
  TenantMongoGenericRepository,
} from '@zma-nestjs-monorepo/zma-repositories';
import { Model } from 'mongoose';

import { IDataServices } from '../../../core';

import {
  FormDocument,
  FormEntity,
  SurveyDocument,
  SurveyEntity,
  UserResponseDocument,
  UserResponseEntity,
} from './entities';

@Injectable()
export class MongoDataServices implements IDataServices, OnApplicationBootstrap {
  surveyService: ITenantGenericRepository<SurveyEntity>;
  userResponseService: ITenantGenericRepository<UserResponseEntity>;
  formService: ITenantGenericRepository<FormEntity>;

  constructor(
    @InjectModel(SurveyEntity.name)
    private surveyRepository: Model<SurveyDocument>,
    @InjectModel(UserResponseEntity.name)
    private userResponseRepository: Model<UserResponseDocument>,
    @InjectModel(FormEntity.name)
    private formRepository: Model<FormDocument>,
  ) {}

  onApplicationBootstrap() {
    this.surveyService = new TenantMongoGenericRepository(this.surveyRepository);
    this.userResponseService = new TenantMongoGenericRepository(this.userResponseRepository);
    this.formService = new TenantMongoGenericRepository(this.formRepository);
  }
}
