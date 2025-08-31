import { Module } from '@nestjs/common';

import { DataServicesModule } from '../../services/data-services/data-services.module';

import { TemplateFactoryUseCase } from './template-factory.use-case.service';
import { TemplateUseCase } from './template.use-case';

@Module({
  imports: [DataServicesModule],
  providers: [TemplateUseCase, TemplateFactoryUseCase],
  exports: [TemplateUseCase, TemplateFactoryUseCase],
})
export class TemplateUseCaseModule {}
