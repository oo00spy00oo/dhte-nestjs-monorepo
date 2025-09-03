import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppConfigService, loadConfigurationIntoEnv } from '@zma-nestjs-monorepo/zma-config';
import { KafkaGroup } from '@zma-nestjs-monorepo/zma-types';
import figlet from 'figlet';
import morgan from 'morgan';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';

async function bootstrap() {
  await loadConfigurationIntoEnv();
  const app = await NestFactory.create(AppModule);
  const appConfigService = app.get(AppConfigService);

  // Attach Kafka microservice
  const kafkaBrokers = appConfigService.getKafkaBrokers;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: kafkaBrokers,
      },
      consumer: {
        groupId: KafkaGroup.Notification,
      },
    },
  });

  app.use(morgan('combined'));
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
    new ValidationPipe({
      exceptionFactory: (errors) => new BadRequestException(errors),
    }),
  );
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.enableShutdownHooks();

  const host = process.env.HOST || '0.0.0.0';
  const port = process.env.PORT || 3000;

  Logger.log('Starting Microservices');
  await app.startAllMicroservices();
  Logger.log('Microservices started');

  await app.listen(port, host);
  if (appConfigService.getNodeEnv === 'development') {
    Logger.log(figlet.textSync('zma-notification !'));
  }
  Logger.log(`🚀 Application is running on: http://${host}:${port}/graphql`);
}

bootstrap();
