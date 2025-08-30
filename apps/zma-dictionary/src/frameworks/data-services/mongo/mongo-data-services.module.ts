import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { IDataServices } from '../../../core';

import { DictionaryEntity, DictionarySchema } from './entities';
import { MongoDataServices } from './mongo-data-services.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: DictionaryEntity.name, schema: DictionarySchema }])],
  providers: [
    {
      provide: IDataServices,
      useClass: MongoDataServices,
    },
  ],
  exports: [IDataServices],
})
export class MongoDataServicesModule {}
