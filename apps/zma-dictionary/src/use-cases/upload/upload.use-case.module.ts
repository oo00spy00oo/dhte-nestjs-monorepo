import { Module } from '@nestjs/common';

import { UploadController } from '../../controllers/upload';
import { R2FileServicesModule } from '../../frameworks/files-services/r2/r2.file-service.module';
import { DataServicesModule } from '../../services/data-services/data-services.module';
import { VirusScannerModule } from '../../services/virus-scanner/virus-scanner.module';

import { UploadUseCase } from './upload.use-case';

import 'multer';

@Module({
  imports: [R2FileServicesModule, DataServicesModule, VirusScannerModule],
  providers: [UploadUseCase],
  controllers: [UploadController],
  exports: [UploadUseCase],
})
export class UploadUseCaseModule {}
