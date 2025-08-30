import { Module } from '@nestjs/common';

import { DataServicesModule } from '../../services/data-services/data-services.module';

import { FormFactoryService } from './form-factory.use-case';
import { FormUseCase } from './form.use-case';

@Module({
  imports: [DataServicesModule],
  providers: [FormUseCase, FormFactoryService],
  exports: [FormUseCase, FormFactoryService],
})
export class FormUseCaseModule {}
