import { Module } from '@nestjs/common';

import { DataServicesModule } from '../../services/data-services/data-services.module';

import { TenantFactoryService } from './tenant-factory.service';
import { TenantUseCase } from './tenant.use-case';

@Module({
  imports: [DataServicesModule],
  providers: [TenantFactoryService, TenantUseCase],
  exports: [TenantFactoryService, TenantUseCase],
})
export class TenantUseCaseModule {}
