import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { IDataServices } from '../../../core';

import {
  FormEntity,
  FormSchema,
  SurveyEntity,
  SurveySchema,
  UserResponseEntity,
  UserResponseSchema,
} from './entities';
import { MongoDataServices } from './mongo-data-services.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SurveyEntity.name, schema: SurveySchema },
      { name: UserResponseEntity.name, schema: UserResponseSchema },
      { name: FormEntity.name, schema: FormSchema },
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
