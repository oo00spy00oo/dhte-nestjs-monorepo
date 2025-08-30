import { Module } from '@nestjs/common';

import { DataServicesModule } from '../../services/data-services/data-services.module';

import { LessonOrderFactoryService } from './lesson-order-factory.use-case.service';
import { LessonOrderUseCase } from './lesson-order.use-case';

@Module({
  imports: [DataServicesModule],
  providers: [LessonOrderUseCase, LessonOrderFactoryService],
  exports: [LessonOrderUseCase],
})
export class LessonOrderUseCaseModule {}
