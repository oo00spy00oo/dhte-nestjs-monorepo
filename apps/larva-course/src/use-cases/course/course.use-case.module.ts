import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AppConfigModule } from '@zma-nestjs-monorepo/zma-config';
import { ServiceName } from '@zma-nestjs-monorepo/zma-types';

import { FnsGrpcConfigService } from '../../services/config';
import { DataServicesModule } from '../../services/data-services/data-services.module';

import { CourseUseCase } from './course.use-case';

@Module({
  imports: [
    DataServicesModule,
    ClientsModule.registerAsync([
      {
        name: ServiceName.FNS,
        imports: [AppConfigModule],
        useClass: FnsGrpcConfigService,
      },
    ]),
  ],
  providers: [CourseUseCase],
  exports: [CourseUseCase],
})
export class CourseUseCaseModule {}
