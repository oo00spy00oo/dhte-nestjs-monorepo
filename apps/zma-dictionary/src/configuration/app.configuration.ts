import { ConfigService } from '@nestjs/config';

export const appConfiguration = (configService: ConfigService) => {
  return {
    r2: {
      dictionaryImagesBucket: configService.get<string>('R2_DICTIONARY_IMAGES_BUCKET'),
      dictionaryAudiosBucket: configService.get<string>('R2_DICTIONARY_AUDIOS_BUCKET'),
      commonAssetsBucket: configService.get<string>('R2_COMMON_ASSETS_BUCKET'),
      region: configService.get<string>('R2_REGION'),
      accountId: configService.get<string>('R2_ACCOUNT_ID'),
      dictionaryAccessKeyId: configService.get<string>('DICTIONARY_ACCESS_KEY_ID'),
      dictionarySecretAccessKey: configService.get<string>('DICTIONARY_SECRET_ACCESS_KEY'),
      courseAccessKeyId: configService.get<string>('COURSE_ACCESS_KEY_ID'),
      courseSecretAccessKey: configService.get<string>('COURSE_SECRET_ACCESS_KEY'),
      dictionaryImagesBaseUrl: configService.get<string>('R2_DICTIONARY_IMAGES_BASE_URL'),
      dictionaryAudiosBaseUrl: configService.get<string>('R2_DICTIONARY_AUDIOS_BASE_URL'),
      commonAssetsBaseUrl: configService.get<string>('R2_COMMON_ASSETS_BASE_URL'),
    },
    analyze: {
      speech: {
        url: configService.get<string>('ANALYZE_SPEECH_URL'),
      },
    },
    clamav: {
      host: configService.get<string>('CLAMAV_HOST'),
      port: parseInt(configService.get<string>('CLAMAV_PORT'), 10),
      timeout: parseInt(configService.get<string>('CLAMAV_TIMEOUT'), 10),
    },
    sampleAiVideoUrl: configService.get<string>('SAMPLE_AI_VIDEO_URL'),
  };
};
