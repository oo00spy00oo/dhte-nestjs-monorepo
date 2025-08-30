import { Module } from '@nestjs/common';

import { R2FileServicesModule } from '../../frameworks/files-services/r2/r2.file-service.module';

@Module({
  imports: [R2FileServicesModule],
  exports: [R2FileServicesModule],
})
export class FileServicesModule {}
