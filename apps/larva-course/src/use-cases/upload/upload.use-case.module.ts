import { Module } from '@nestjs/common';

import { UploadController } from '../../controllers/upload/upload.controller';
import { R2FileServicesModule } from '../../frameworks/files-services/r2/r2.file-service.module';

import { UploadUseCase } from './upload.use-case';

import 'multer';

@Module({
  imports: [R2FileServicesModule],
  providers: [UploadUseCase],
  controllers: [UploadController],
  exports: [UploadUseCase],
})
export class UploadUseCaseModule {}
