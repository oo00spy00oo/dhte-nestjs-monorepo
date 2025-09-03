import { Module } from '@nestjs/common';

import { DataServicesModule } from '../../../services/data-services/data-services.module';

import { InAppChannelFactoryService } from './in-app-channel-factory.use-case.service';
import { InAppChannelUseCase } from './in-app-channel.use-case';

@Module({
  imports: [DataServicesModule],
  providers: [InAppChannelFactoryService, InAppChannelUseCase],
  exports: [InAppChannelFactoryService, InAppChannelUseCase],
})
export class InAppChannelUseCaseModule {}
