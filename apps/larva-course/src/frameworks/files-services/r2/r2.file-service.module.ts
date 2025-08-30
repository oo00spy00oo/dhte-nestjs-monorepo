import { Module } from '@nestjs/common';

import { R2FileService } from './r2.file-service.service';

@Module({
  providers: [R2FileService],
  exports: [R2FileService],
})
export class R2FileServicesModule {}
