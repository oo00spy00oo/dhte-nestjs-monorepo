import { ConfigService } from '@nestjs/config';

export const appConfiguration = (configService: ConfigService) => {
  return {
    r2: {
      accountId: configService.get<string>('R2_ACCOUNT_ID'),
      stagingAccessKeyId: configService.get<string>('R2_STAGING_ACCESS_KEY_ID'),
      stagingSecretAccessKey: configService.get<string>('R2_STAGING_SECRET_ACCESS_KEY'),
      permanentAccessKeyId: configService.get<string>('R2_PERMANENT_ACCESS_KEY_ID'),
      permanentSecretAccessKey: configService.get<string>('R2_PERMANENT_SECRET_ACCESS_KEY'),
    },
    s3: {
      accountId: configService.get<string>('S3_ACCOUNT_ID'),
      stagingAccessKeyId: configService.get<string>('S3_STAGING_ACCESS_KEY_ID'),
      stagingSecretAccessKey: configService.get<string>('S3_STAGING_SECRET_ACCESS_KEY'),
      permanentAccessKeyId: configService.get<string>('S3_PERMANENT_ACCESS_KEY_ID'),
      permanentSecretAccessKey: configService.get<string>('S3_PERMANENT_SECRET_ACCESS_KEY'),
    },
    cdn: {
      host: configService.get<string>('CDN_HOST'),
    },
    buckets: {
      staging: {
        name: configService.get<string>('BUCKETS_STAGING_NAME'),
        provider: configService.get<string>('BUCKETS_STAGING_PROVIDER'),
      },
      image: {
        name: configService.get<string>('BUCKETS_IMAGE_NAME'),
        provider: configService.get<string>('BUCKETS_IMAGE_PROVIDER'),
      },
      video: {
        name: configService.get<string>('BUCKETS_VIDEO_NAME'),
        provider: configService.get<string>('BUCKETS_VIDEO_PROVIDER'),
      },
      audio: {
        name: configService.get<string>('BUCKETS_AUDIO_NAME'),
        provider: configService.get<string>('BUCKETS_AUDIO_PROVIDER'),
      },
      document: {
        name: configService.get<string>('BUCKETS_DOCUMENT_NAME'),
        provider: configService.get<string>('BUCKETS_DOCUMENT_PROVIDER'),
      },
    },
    clamav: {
      enabled: configService.get<string>('CLAMAV_ENABLED', 'false') === 'true',
      deleteInfectedFiles:
        configService.get<string>('CLAMAV_DELETE_INFECTED_FILES', 'true') === 'true',
      host: configService.get<string>('CLAMAV_HOST'),
      port: parseInt(configService.get<string>('CLAMAV_PORT'), 10),
      timeout: parseInt(configService.get<string>('CLAMAV_TIMEOUT'), 10),
    },
    ffmpeg: {
      path: configService.get<string>('FFMPEG_PATH', ''),
    },
  };
};
