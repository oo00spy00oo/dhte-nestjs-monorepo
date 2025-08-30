import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { DataServicesModule } from '../../services/data-services/data-services.module';

import { FileFactoryService } from './file-factory.user-case.service';
import { FileUseCase } from './file.use-case';

@Module({
  imports: [DataServicesModule, HttpModule],
  providers: [FileFactoryService, FileUseCase],
  exports: [FileFactoryService, FileUseCase],
})
export class FileUseCaseModule {}
