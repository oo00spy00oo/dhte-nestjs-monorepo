import { join } from 'node:path';

import { blockFieldSuggestionsPlugin } from '@escape.tech/graphql-armor-block-field-suggestions';
import { characterLimitPlugin } from '@escape.tech/graphql-armor-character-limit';
import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { useDisableIntrospection } from '@graphql-yoga/plugin-disable-introspection';
import { createInMemoryCache, useResponseCache } from '@graphql-yoga/plugin-response-cache';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { PassportModule } from '@nestjs/passport';
import {
  AppConfigModule,
  AppConfigService,
  armor,
  winstonConfigTransports,
} from '@zma-nestjs-monorepo/zma-config';
import { GqlAuthGuard, GuardModule } from '@zma-nestjs-monorepo/zma-decorators';
import { ZmaI18nModule } from '@zma-nestjs-monorepo/zma-i18n';
import { AppExceptionFilter } from '@zma-nestjs-monorepo/zma-middlewares';
import { DirectiveLocation, GraphQLDirective } from 'graphql';
import { WinstonModule } from 'nest-winston';

import { upperDirectiveTransformer } from './common/directives/upper-case.directive';
import { HealthModule } from './controllers/health/health.module';
import { MeetingMutation } from './controllers/mutations';
import { MeetingResolver } from './controllers/resolvers/meeting.resolver';
import { MeetingUseCaseModule } from './use-cases/meeting/meeting.use-case.module';

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
            ? join(process.cwd(), 'graphqls/zma-meeting/schema.gql')
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
    HealthModule,
    GuardModule,
    ZmaI18nModule,
    MeetingUseCaseModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AppExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: GqlAuthGuard,
    },
    MeetingResolver,
    MeetingMutation,
  ],
})
export class AppModule {}
