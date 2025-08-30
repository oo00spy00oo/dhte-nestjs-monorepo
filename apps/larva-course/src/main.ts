import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppConfigService, loadConfigurationIntoEnv } from '@zma-nestjs-monorepo/zma-config';
import { KafkaGroup } from '@zma-nestjs-monorepo/zma-types';
import figlet from 'figlet';
import morgan from 'morgan';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';

async function bootstrap() {
  await loadConfigurationIntoEnv();
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfigService);

  // Attach Kafka microservice
  const kafkaBrokers = configService.getKafkaBrokers;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: kafkaBrokers,
      },
      consumer: {
        groupId: KafkaGroup.LarvaCourse,
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

  // Get the ConfigService instance

  // Only display figlet banner in development mode
  if (configService.get('NODE_ENV') === 'development') {
    Logger.log(figlet.textSync('larva-course !'));
  }

  Logger.log(`🚀 Application is running on: http://${host}:${port}/graphql`);
}

bootstrap();
