import { Module } from '@nestjs/common';

import { FileService } from './file-service.service';

@Module({
  providers: [FileService],
  exports: [FileService],
})
export class FileServicesModule {}
