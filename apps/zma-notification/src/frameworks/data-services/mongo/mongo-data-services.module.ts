import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { IDataServices } from '../../../core';

import {
  InAppNotificationEntity,
  InAppNotificationSchema,
  TemplateEntity,
  TemplateSchema,
} from './entities';
import { MongoDataServices } from './mongo-data-services.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InAppNotificationEntity.name, schema: InAppNotificationSchema },
      { name: TemplateEntity.name, schema: TemplateSchema },
    ]),
  ],
  providers: [
    {
      provide: IDataServices,
      useClass: MongoDataServices,
    },
  ],
  exports: [IDataServices],
})
export class MongoDataServicesModule {}
