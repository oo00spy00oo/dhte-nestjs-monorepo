import { ConfigService } from '@nestjs/config';

export const appConfiguration = (configService: ConfigService) => {
  return {
    surveys: {
      onboarding: {
        english: {
          surveyId: configService.get<string>('ONBOARDING_ENGLISH_SURVEY_ID'),
          questionId: configService.get<string>('ONBOARDING_ENGLISH_QUESTION_ID'),
        },
      },
    },
    r2: {
      commonAssetsBucket: configService.get<string>('R2_COMMON_ASSETS_BUCKET'),
      userAudiosBucket: configService.get<string>('R2_USER_AUDIOS_BUCKET'),
      region: configService.get<string>('R2_REGION'),
      accountId: configService.get<string>('R2_ACCOUNT_ID'),
      accessKeyId: configService.get<string>('ACCESS_KEY_ID'),
      secretAccessKey: configService.get<string>('SECRET_ACCESS_KEY'),
      commonAssetsBaseUrl: configService.get<string>('R2_COMMON_ASSETS_BASE_URL'),
      userAudiosBaseUrl: configService.get<string>('R2_USER_AUDIOS_BASE_URL'),
      imageAssetsBaseUrl: configService.get<string>('R2_IMAGE_ASSETS_BASE_URL'),
    },
    maxCollectionPerUser: parseInt(configService.get('MAX_COLLECTION_PER_USER'), 10),
    maxCollectionItem: parseInt(configService.get('MAX_COLLECTION_ITEM'), 10),
    clamav: {
      host: configService.get<string>('CLAMAV_HOST'),
      port: parseInt(configService.get<string>('CLAMAV_PORT'), 10),
      timeout: parseInt(configService.get<string>('CLAMAV_TIMEOUT'), 10),
    },
    sampleAiVideoUrl: configService.get<string>('SAMPLE_AI_VIDEO_URL'),
  };
};
