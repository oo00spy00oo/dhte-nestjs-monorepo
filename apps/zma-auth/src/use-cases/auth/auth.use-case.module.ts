import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule } from '@nestjs/microservices';
import { AppConfigModule } from '@zma-nestjs-monorepo/zma-config';
import { KafkaToken, ServiceName } from '@zma-nestjs-monorepo/zma-types';

import { AuthKafkaConfigService, UserGrpcConfigService } from '../../services/config';
import { ZaloModule } from '../../services/zalo/zalo.module';

import { AuthFactoryService } from './auth-factory.service';
import { AuthUseCase } from './auth.use-case';

@Module({
  imports: [
    ZaloModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRATION_TIME') },
      }),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync([
      {
        name: ServiceName.USER,
        imports: [AppConfigModule],
        useClass: UserGrpcConfigService,
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: KafkaToken.AuthService,
        imports: [AppConfigModule],
        useClass: AuthKafkaConfigService,
      },
    ]),
  ],
  providers: [AuthUseCase, AuthFactoryService],
  exports: [AuthUseCase],
})
export class AuthUseCaseModule {}
