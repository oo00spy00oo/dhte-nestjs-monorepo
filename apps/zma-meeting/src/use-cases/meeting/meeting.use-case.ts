import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeetingServiceRoomModel } from '@zma-nestjs-monorepo/zma-types/models/meeting';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { SetOptions } from 'redis';

import { appConfiguration } from '../../configuration';
import { MeetingServiceCreateRoomGqlOutput } from '../../core/outputs';
import { RedisService } from '../../services/redis/redis.service';
import { MeetingUtils } from '../../utils/meeting.utils';

@Injectable()
export class MeetingUseCase {
  private readonly logger = new Logger(MeetingUseCase.name);
  private appConfig: ReturnType<typeof appConfiguration>;
  private roomTtl: number;
  private DEFAULT_RETRY_ATTEMPTS = 10;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.appConfig = appConfiguration(this.configService);
    this.roomTtl = this.appConfig.meeting.roomTtl;
  }

  async createRoom(adminId: string): Promise<MeetingServiceCreateRoomGqlOutput> {
    for (let i = 0; i < this.DEFAULT_RETRY_ATTEMPTS; i++) {
      const code = MeetingUtils.generateRoomCode();
      const room: MeetingServiceRoomModel = {
        id: IdUtils.uuidv7(),
        isActive: true,
        code,
        adminId,
        isAdminOnline: false,
        participants: [],
      };

      const options: SetOptions = {
        expiration: { type: 'EX', value: this.roomTtl },
        condition: 'NX',
      };

      const success = await this.redisService.set({
        key: `meeting:code:${code}`,
        value: room,
        options,
      });

      if (success) {
        return { code };
      }
    }

    throw new Error('Failed to create a unique meeting room.');
  }
}
