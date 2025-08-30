import { Module } from '@nestjs/common';

import { DataServicesModule } from '../../services/data-services/data-services.module';

import { MasterDataFactoryService } from './master-data-factory.user-case.service';
import { MasterDataUseCase } from './master-data.use-case';

@Module({
  imports: [DataServicesModule],
  providers: [MasterDataFactoryService, MasterDataUseCase],
  exports: [MasterDataFactoryService, MasterDataUseCase],
})
export class MasterDataUseCaseModule {}
