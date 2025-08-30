import { join } from 'node:path';

import { Module } from '@nestjs/common';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, 'i18n'),
        watch: process.env['NODE_ENV'] === 'development',
      },
      resolvers: [{ use: AcceptLanguageResolver, options: ['Accept-Language'] }],
    }),
  ],
  exports: [I18nModule],
})
export class ZmaI18nModule {}
