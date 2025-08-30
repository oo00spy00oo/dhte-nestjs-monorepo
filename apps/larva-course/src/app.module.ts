import { join } from 'node:path';

import { blockFieldSuggestionsPlugin } from '@escape.tech/graphql-armor-block-field-suggestions';
import { characterLimitPlugin } from '@escape.tech/graphql-armor-character-limit';
import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { useDisableIntrospection } from '@graphql-yoga/plugin-disable-introspection';
import { createInMemoryCache, useResponseCache } from '@graphql-yoga/plugin-response-cache';
import { CacheModule } from '@nestjs/cache-manager';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { TerminusModule } from '@nestjs/terminus';
import {
  AppConfigModule,
  AppConfigService,
  armor,
  MongooseConfigService,
  winstonConfigTransports,
} from '@zma-nestjs-monorepo/zma-config';
import { GqlAuthGuard, GuardModule, JwtStrategy } from '@zma-nestjs-monorepo/zma-decorators';
import { ZmaI18nModule } from '@zma-nestjs-monorepo/zma-i18n';
import { AppExceptionFilter } from '@zma-nestjs-monorepo/zma-middlewares';
import { DirectiveLocation, GraphQLDirective } from 'graphql';
import { WinstonModule } from 'nest-winston';

import { upperDirectiveTransformer } from './common/directives/upper-case.directive';
import { HealthModule } from './controllers/health/health.module';
import { LarvaCourseKafkaController } from './controllers/kafka';
import {
  UserCollectionMutation,
  LessonMutation,
  SentenceMutation,
  TopicMutation,
} from './controllers/mutations';
import { AnalyzeMutation } from './controllers/mutations/analyze.mutation';
import {
  CourseResolver,
  UserCollectionResolver,
  LessonResolver,
  SentenceResolver,
  TopicResolver,
} from './controllers/resolvers';
import { AnalyzeAiServicesModule } from './frameworks/ai-services/analyze/analyze.ai-service.module';
import { DataServicesModule } from './services/data-services/data-services.module';
import { AnalyzeUseCaseModule } from './use-cases/analyze/analyze.use-case.module';
import { CourseUseCaseModule } from './use-cases/course/course.use-case.module';
import { LessonUseCaseModule } from './use-cases/lesson/lesson.use-case.module';
import { SentenceUseCaseModule } from './use-cases/sentence/sentence.use-case.module';
import { TopicUseCaseModule } from './use-cases/topic/topic.use-case.module';
import { TopicOrderUseCaseModule } from './use-cases/topic-order/topic-order.use-case.module';
import { UploadUseCaseModule } from './use-cases/upload/upload.use-case.module';
import { UserCollectionUseCaseModule } from './use-cases/user-collection/user-collection.use-case.module';

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
            ? join(process.cwd(), 'graphqls/larva-course/schema.gql')
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
    TerminusModule.forRoot({
      gracefulShutdownTimeoutMs: 9000,
      errorLogStyle: 'pretty',
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    HealthModule,
    DataServicesModule,
    SentenceUseCaseModule,
    UserCollectionUseCaseModule,
    LessonUseCaseModule,
    TopicUseCaseModule,
    TopicOrderUseCaseModule,
    CourseUseCaseModule,
    AnalyzeUseCaseModule,
    ZmaI18nModule,
    GuardModule,
    UploadUseCaseModule,
    AnalyzeAiServicesModule,
  ],
  controllers: [LarvaCourseKafkaController],
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
    SentenceMutation,
    UserCollectionMutation,
    UserCollectionResolver,
    SentenceResolver,
    LessonMutation,
    LessonResolver,
    TopicMutation,
    TopicResolver,
    CourseResolver,
    AnalyzeMutation,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const serviceName = this.configService.get('SERVICE_NAME');
    const environment = this.configService.get('NODE_ENV');
    const port = this.configService.get('PORT');

    Logger.log(`🚀 ${serviceName} service starting in ${environment} mode on port ${port}`);
  }
}
