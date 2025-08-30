import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { RbacService } from '../services';

import { JwtStrategy } from './jwt.strategy';
import { RbacGuard } from './rbac.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRATION_TIME') },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [RbacService],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RbacGuard,
    },
    JwtStrategy,
    RbacService,
  ],
})
export class RbacModule {}
