import { ConfigService } from '@nestjs/config';

export const appConfiguration = (configService: ConfigService) => {
  return {
    redis: {
      url: configService.get<string>('REDIS_URL', 'localhost:6379'),
    },
    meeting: {
      roomTtl: configService.get<number>('MEETING_ROOM_TTL'),
    },
  };
};
