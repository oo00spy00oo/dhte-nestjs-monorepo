import { ConfigService } from '@nestjs/config';

import { CommonUtil } from '../utils';

export const appConfiguration = (configService: ConfigService) => {
  return {
    authExpiration: {
      registration: configService.get('AUTH_REGISTRATION_EXPIRATION'),
      forgotPassword: configService.get('AUTH_FORGOT_PASSWORD_EXPIRATION'),
    },
    jwt: {
      secret: configService.get('JWT_SECRET'),
      expirationTime: configService.get('JWT_EXPIRATION_TIME'),
      refreshSecret: configService.get('JWT_REFRESH_SECRET'),
      refreshExpirationTime: configService.get('JWT_REFRESH_EXPIRATION_TIME'),
    },
    appDomain: configService.get('APP_DOMAIN'),
    maxLoginAttempts: parseInt(configService.get('MAX_LOGIN_ATTEMPTS'), 10),
    passwordPolicy: {
      minLength: parseInt(configService.get('PASSWORD_POLICY_MIN_LENGTH'), 10),
      maxLength: parseInt(configService.get('PASSWORD_POLICY_MAX_LENGTH'), 10),
      requireLowercase: CommonUtil.parseBooleanFromEnv(
        configService.get('PASSWORD_POLICY_LOWERCASE'),
      ),
      requireUppercase: CommonUtil.parseBooleanFromEnv(
        configService.get('PASSWORD_POLICY_UPPERCASE'),
      ),
      requireNumbers: CommonUtil.parseBooleanFromEnv(configService.get('PASSWORD_POLICY_NUMBERS')),
      requireSpecialCharacters: CommonUtil.parseBooleanFromEnv(
        configService.get('PASSWORD_POLICY_SPECIAL_CHARS'),
      ),
    },
    google: {
      clientId: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
    },
  };
};
