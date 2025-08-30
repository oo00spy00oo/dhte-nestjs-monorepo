import { ConfigService } from '@nestjs/config';

export const appConfiguration = (configService: ConfigService) => {
  return {
    redis: {
      url: configService.get<string>('REDIS_URL', 'localhost:6379'),
    },
    mediasoup: {
      rtc: {
        minPort: configService.get<number>('MEDIASOUP_RTC_MIN_PORT', 40000),
        maxPort: configService.get<number>('MEDIASOUP_RTC_MAX_PORT', 40500),
      },
      announcedIp: configService.get<string>('MEDIASOUP_ANNOUNCED_IP', '94.100.26.6'),
    },
    meeting: {
      roomTtl: configService.get<number>('MEETING_ROOM_TTL', 21600),
    },
    analyze: {
      speech: {
        url: configService.get<string>('ANALYZE_SPEECH_URL'),
      },
    },
  };
};
