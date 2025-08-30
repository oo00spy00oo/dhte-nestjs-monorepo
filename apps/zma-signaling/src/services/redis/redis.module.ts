import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { appConfiguration } from '../../configuration';

import { RedisService } from './redis.service';

@Module({
  providers: [
    RedisService,
    {
      provide: 'APP_CONFIG',
      useFactory: (configService: ConfigService) => appConfiguration(configService),
      inject: [ConfigService],
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
