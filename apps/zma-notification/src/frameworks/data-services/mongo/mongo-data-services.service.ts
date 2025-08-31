import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ITenantGenericRepository,
  TenantMongoGenericRepository,
} from '@zma-nestjs-monorepo/zma-repositories';
import { Model } from 'mongoose';

import { IDataServices } from '../../../core';

import {
  InAppNotificationDocument,
  InAppNotificationEntity,
  TemplateDocument,
  TemplateEntity,
} from './entities';

@Injectable()
export class MongoDataServices implements IDataServices, OnApplicationBootstrap {
  inAppNotificationService: ITenantGenericRepository<InAppNotificationEntity>;
  templateService: ITenantGenericRepository<TemplateEntity>;

  constructor(
    @InjectModel(InAppNotificationEntity.name)
    private inAppNotificationRepository: Model<InAppNotificationDocument>,
    @InjectModel(TemplateEntity.name)
    private templateRepository: Model<TemplateDocument>,
  ) {}

  onApplicationBootstrap() {
    this.inAppNotificationService = new TenantMongoGenericRepository(
      this.inAppNotificationRepository,
    );
    this.templateService = new TenantMongoGenericRepository(this.templateRepository);
  }
}
