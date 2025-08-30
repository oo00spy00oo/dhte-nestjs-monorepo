import { Module } from '@nestjs/common';

import { DataServicesModule } from '../../services/data-services/data-services.module';

import { TopicOrderFactoryService } from './topic-order-factory.use-case.service';
import { TopicOrderUseCase } from './topic-order.use-case';

@Module({
  imports: [DataServicesModule],
  providers: [TopicOrderUseCase, TopicOrderFactoryService],
  exports: [TopicOrderUseCase],
})
export class TopicOrderUseCaseModule {}
