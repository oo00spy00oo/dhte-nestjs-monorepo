import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import {
  AppConfigModule,
  AppConfigService,
  winstonConfigTransports,
} from '@zma-nestjs-monorepo/zma-config';
import { GqlAuthGuard, GuardModule } from '@zma-nestjs-monorepo/zma-decorators';
import { ZmaI18nModule } from '@zma-nestjs-monorepo/zma-i18n';
import { AppExceptionFilter } from '@zma-nestjs-monorepo/zma-middlewares';
import { ZmaOpenAiModule } from '@zma-nestjs-monorepo/zma-utils';
import { WinstonModule } from 'nest-winston';

import { HealthModule } from './controllers/health/health.module';
import { SignalingUseCaseModule } from './use-cases/signaling/signaling.use-case.module';

@Module({
  imports: [
    AppConfigModule,
    WinstonModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (appConfigService: AppConfigService) => {
        const transports = winstonConfigTransports({
          nodeEnv: appConfigService.getNodeEnv,
          serviceName: appConfigService.getServiceName,
        });
        return {
          transports,
        };
      },
      inject: [AppConfigService],
    }),
    PassportModule,
    HealthModule,
    GuardModule,
    ZmaI18nModule,
    ZmaOpenAiModule,
    SignalingUseCaseModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AppExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: GqlAuthGuard,
    },
  ],
})
export class AppModule {}
