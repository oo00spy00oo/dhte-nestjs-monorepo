import { join } from 'node:path';

import { blockFieldSuggestionsPlugin } from '@escape.tech/graphql-armor-block-field-suggestions';
import { characterLimitPlugin } from '@escape.tech/graphql-armor-character-limit';
import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { useDisableIntrospection } from '@graphql-yoga/plugin-disable-introspection';
import { createInMemoryCache, useResponseCache } from '@graphql-yoga/plugin-response-cache';
import { CacheModule } from '@nestjs/cache-manager';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import {
  AppConfigModule,
  AppConfigService,
  armor,
  MongooseConfigService,
  winstonConfigTransports,
} from '@zma-nestjs-monorepo/zma-config';
import { GuardModule } from '@zma-nestjs-monorepo/zma-decorators';
import { ZmaI18nModule } from '@zma-nestjs-monorepo/zma-i18n';
import { DirectiveLocation, GraphQLDirective } from 'graphql';
import { WinstonModule } from 'nest-winston';

import { upperDirectiveTransformer } from './common/directives/upper-case.directive';
import { KafkaController } from './controllers';
import { HealthModule } from './controllers/health/health.module';
import { NotificationMutation } from './controllers/mutations';
import { NotificationResolver } from './controllers/resolvers';
import { DataServicesModule } from './services/data-services/data-services.module';
import { NotificationUseCaseModule } from './use-cases/notification/notification.use-case.module';
import { InAppChannelUseCaseModule } from './use-cases/notification-channels';
import { TemplateUseCaseModule } from './use-cases/template/template.use-case.module';

const protection = armor.protect();

// Enhanced cache configuration
const cache = createInMemoryCache({
  max: 100000, // Maximum number of entries
});
// Pre-warm cache
cache.invalidate([]);

@Module({
  imports: [
    AppConfigModule,
    WinstonModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (appConfigService: AppConfigService) => {
        const transports = winstonConfigTransports({
          nodeEnv: appConfigService.getNodeEnv,
          serviceName: appConfigService.getServiceName,
        });
        return {
          transports,
        };
      },
      inject: [AppConfigService],
    }),
    PassportModule,
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      imports: [AppConfigModule],
      useFactory: (configService: AppConfigService) => {
        const isProduction = configService.getNodeEnv === 'production';
        const isDevelopment = configService.getNodeEnv === 'development';

        return {
          resolvers: {},
          autoSchemaFile: isDevelopment
            ? join(process.cwd(), 'graphqls/zma-notification/schema.gql')
            : true,
          transformSchema: (schema) => upperDirectiveTransformer(schema, 'upper'),
          sortSchema: true,
          buildSchemaOptions: {
            directives: [
              new GraphQLDirective({
                name: 'upper',
                locations: [DirectiveLocation.FIELD_DEFINITION],
              }),
            ],
          },
          graphiql: !isProduction,
          healthCheckEndpoint: '/health',
          cors: {
            origin: isProduction ? configService.getAllowedOrigins : [],
            credentials: true,
          },
          context: ({ request }) => ({ request }),
          plugins: [
            ...protection.plugins,
            useResponseCache({
              // global cache
              session: () => null,
              ttl: 0,
              ttlPerType: {},
              ttlPerSchemaCoordinate: {},
              cache,
            }),
            useDisableIntrospection({
              isDisabled: () => isProduction,
            }),
            characterLimitPlugin({
              maxLength: 15000,
            }),
            ...(isProduction ? [blockFieldSuggestionsPlugin()] : []),
          ],
          maskedErrors: isProduction,
          batching: {
            limit: 10,
          },
          parserCache: true,
          validationCache: true,
        };
      },
      inject: [AppConfigService],
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
      inject: [ConfigService],
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    HealthModule,
    DataServicesModule,
    ZmaI18nModule,
    NotificationUseCaseModule,
    InAppChannelUseCaseModule,
    TemplateUseCaseModule,
    GuardModule,
  ],
  controllers: [KafkaController],
  providers: [AppConfigService, NotificationResolver, NotificationMutation],
})
export class AppModule {}
