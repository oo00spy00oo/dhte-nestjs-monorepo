import { Module } from '@nestjs/common';

import { DataServicesModule } from '../../services/data-services/data-services.module';

import { SurveyFactoryUseCase } from './survey-factory.use-case';
import { SurveyUseCase } from './survey.use-case';

@Module({
  imports: [DataServicesModule],
  providers: [SurveyUseCase, SurveyFactoryUseCase],
  exports: [SurveyUseCase, SurveyFactoryUseCase],
})
export class SurveyUseCaseModule {}
