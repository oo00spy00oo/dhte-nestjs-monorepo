import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { appConfiguration } from '../../configuration';

import { MediasoupService } from './mediasoup.service';

@Module({
  providers: [
    MediasoupService,
    {
      provide: 'APP_CONFIG',
      useFactory: (configService: ConfigService) => appConfiguration(configService),
      inject: [ConfigService],
    },
  ],
  exports: [MediasoupService],
})
export class MediasoupModule {}
