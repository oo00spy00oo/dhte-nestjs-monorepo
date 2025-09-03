import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

import { NodeMailerProvider } from './providers/node-mailer.provider';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('SMTP_HOST'),
          port: config.get<number>('SMTP_PORT'),
          auth: {
            user: config.get('SMTP_USER'),
            pass: config.get('SMTP_PASSWORD'),
          },
        },
        defaults: {
          from: config.get('SMTP_FROM'),
        },
      }),
    }),
  ],
  providers: [NodeMailerProvider],
  exports: [NodeMailerProvider],
})
export class EmailChannelUseCaseModule {}
