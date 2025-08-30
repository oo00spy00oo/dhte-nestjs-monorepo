import { join } from 'node:path';

import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppConfigService, loadConfigurationIntoEnv } from '@zma-nestjs-monorepo/zma-config';
import { KafkaGroup, ServiceName } from '@zma-nestjs-monorepo/zma-types';
import figlet from 'figlet';
import morgan from 'morgan';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';

async function bootstrap() {
  await loadConfigurationIntoEnv();
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfigService);
  app.use(morgan('combined'));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
    new ValidationPipe({
      exceptionFactory: (errors) => new BadRequestException(errors),
    }),
  );
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.enableShutdownHooks();

  // Connect to gRPC
  const grpcUrl = configService.getGrpcUrl;
  Logger.log(`Connecting to gRPC at ${grpcUrl}`);
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      url: grpcUrl,
      package: ServiceName.USER,
      protoPath: join(__dirname, 'src/proto/user.proto'),
    },
  });

  // Attach Kafka microservice
  const kafkaBrokers = configService.getKafkaBrokers;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: kafkaBrokers,
      },
      consumer: {
        groupId: KafkaGroup.User,
      },
    },
  });

  // Start microservice
  await app.startAllMicroservices();

  // Start HTTP server
  const host = process.env.HOST || '0.0.0.0';
  const port = process.env.PORT || 3000;

  await app.listen(port);
  if (configService.getNodeEnv === 'development') {
    Logger.log(figlet.textSync('zma-user !'));
  }
  Logger.log(`🚀 Application is running on: http://${host}:${port}/graphql`);
}

bootstrap();
