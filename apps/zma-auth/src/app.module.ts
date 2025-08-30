import { join } from 'node:path';

import { blockFieldSuggestionsPlugin } from '@escape.tech/graphql-armor-block-field-suggestions';
import { characterLimitPlugin } from '@escape.tech/graphql-armor-character-limit';
import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { useDisableIntrospection } from '@graphql-yoga/plugin-disable-introspection';
import { createInMemoryCache, useResponseCache } from '@graphql-yoga/plugin-response-cache';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TerminusModule } from '@nestjs/terminus';
import {
  AppConfigModule,
  AppConfigService,
  armor,
  winstonConfigTransports,
} from '@zma-nestjs-monorepo/zma-config';
import { GqlAuthGuard, GuardModule, JwtStrategy } from '@zma-nestjs-monorepo/zma-decorators';
import { ZmaI18nModule } from '@zma-nestjs-monorepo/zma-i18n';
import { AppExceptionFilter } from '@zma-nestjs-monorepo/zma-middlewares';
import { DirectiveLocation, GraphQLDirective } from 'graphql';
import { WinstonModule } from 'nest-winston';

import { upperDirectiveTransformer } from './common/directives/upper-case.directive';
import { HealthModule } from './controllers/health/health.module';
import { AuthMutation } from './controllers/mutations';
import { AuthResolver } from './controllers/resolvers';
import { AuthUseCaseModule } from './use-cases/auth/auth.use-case.module';

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
            ? join(process.cwd(), 'graphqls/zma-auth/schema.gql')
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
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: async (appConfigService: AppConfigService) => ({
        secret: appConfigService.getJwtSecret,
        signOptions: { expiresIn: appConfigService.get('JWT_EXPIRATION_TIME') },
      }),
      inject: [AppConfigService],
    }),
    TerminusModule.forRoot({
      gracefulShutdownTimeoutMs: 9000,
      errorLogStyle: 'pretty',
    }),
    GuardModule,
    HealthModule,
    AuthUseCaseModule,
    ZmaI18nModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AppExceptionFilter,
    },
    JwtStrategy,
    AuthResolver,
    AuthMutation,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly appConfigService: AppConfigService) {}

  onModuleInit() {
    const serviceName = this.appConfigService.getServiceName;
    const environment = this.appConfigService.getNodeEnv;
    const port = this.appConfigService.getServicePort;

    Logger.log(`🚀 ${serviceName} service starting in ${environment} mode on port ${port}`);
  }
}
