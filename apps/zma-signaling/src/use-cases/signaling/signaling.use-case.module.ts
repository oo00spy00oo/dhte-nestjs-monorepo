import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZmaOpenAiModule } from '@zma-nestjs-monorepo/zma-utils';

import { appConfiguration } from '../../configuration';
import { MediasoupModule } from '../../services/mediasoup/mediasoup.module';
import { RedisModule } from '../../services/redis/redis.module';

import { MediasoupManagerService } from './managers/mediasoup-manager.service';
import { RoomManagerService } from './managers/room-manager.service';
import { SocketManagerService } from './managers/socket-manager.service';
import { TranscriptManagerService } from './managers/transcript-manager.service';
import { UserMutexService } from './managers/user-mutex.service';
import { SignalingUseCase } from './signaling.use-case';
import { SignalingWebSocketGateWay } from './signaling.websocket.gateway';

@Module({
  imports: [RedisModule, MediasoupModule, ZmaOpenAiModule],
  providers: [
    SignalingWebSocketGateWay,
    SignalingUseCase,
    {
      provide: 'APP_CONFIG',
      useFactory: (configService: ConfigService) => appConfiguration(configService),
      inject: [ConfigService],
    },
    SocketManagerService,
    RoomManagerService,
    MediasoupManagerService,
    TranscriptManagerService,
    UserMutexService,
  ],
})
export class SignalingUseCaseModule {}
