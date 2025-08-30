import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppConfigService, loadConfigurationIntoEnv } from '@zma-nestjs-monorepo/zma-config';
import figlet from 'figlet';
import morgan from 'morgan';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';

async function bootstrap() {
  await loadConfigurationIntoEnv();
  const app = await NestFactory.create(AppModule);
  // Get the AppConfigService instance
  const appConfigService = app.get(AppConfigService);

  app.use(morgan('combined'));
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
    new ValidationPipe({
      exceptionFactory: (errors) => new BadRequestException(errors),
    }),
  );
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.enableShutdownHooks();

  Logger.log('Starting Microservices');
  await app.startAllMicroservices();
  Logger.log('Microservices started');

  const host = process.env.HOST || '0.0.0.0';
  const port = process.env.PORT || 3000;

  await app.listen(port, host);

  // Only display figlet banner in development mode
  if (appConfigService.getNodeEnv === 'development') {
    Logger.log(figlet.textSync('zma-signaling !'));
  }

  Logger.log(`🚀 Application is running on: http://${host}:${port}/graphql`);
}

bootstrap();
