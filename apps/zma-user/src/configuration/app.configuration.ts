import { ConfigService } from '@nestjs/config';

export const appConfiguration = (configService: ConfigService) => {
  return {
    r2: {
      imageAssetsBaseUrl: configService.get<string>('R2_IMAGE_ASSETS_BASE_URL'),
    },
  };
};
