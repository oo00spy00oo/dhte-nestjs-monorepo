import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { parseConfig } from '../../lib';

import { AppConfigService } from './app-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      ignoreEnvFile: process.env['NODE_ENV'] !== 'development',
      load: [parseConfig],
      validationOptions: {
        abortEarly: true,
      },
      expandVariables: true,
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
