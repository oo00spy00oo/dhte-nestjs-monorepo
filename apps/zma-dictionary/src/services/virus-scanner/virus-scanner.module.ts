import { Module } from '@nestjs/common';

import { VirusScannerService } from './virus-scanner.service';

@Module({
  imports: [],
  providers: [VirusScannerService],
  exports: [VirusScannerService],
})
export class VirusScannerModule {}
