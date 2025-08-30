import { join } from 'node:path';

import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppConfigService, loadConfigurationIntoEnv } from '@zma-nestjs-monorepo/zma-config';
import { ServiceName } from '@zma-nestjs-monorepo/zma-types';
import figlet from 'figlet';
import * as googleProtoFiles from 'google-proto-files';
import morgan from 'morgan';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';

async function bootstrap() {
  await loadConfigurationIntoEnv();
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfigService);

  // GRPC Server Configuration
  const grpcUrl = configService.getGrpcUrl;
  Logger.log(`Connecting to gRPC at ${grpcUrl}`);
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: ServiceName.STORAGE,
      protoPath: join(__dirname, 'src/proto/storage.proto'),
      url: grpcUrl,
      loader: {
        includeDirs: [googleProtoFiles.getProtoPath('google/protobuf')],
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

  Logger.log('Starting Microservices');
  await app.startAllMicroservices();
  Logger.log('Microservices started');

  const host = process.env.HOST || '0.0.0.0';
  const port = process.env.PORT || 3000;

  await app.listen(port, host);

  // Only display figlet banner in development mode
  if (configService.get('NODE_ENV') === 'development') {
    Logger.log(figlet.textSync('zma-storage !'));
  }

  Logger.log(`🚀 Application is running on: http://${host}:${port}/graphql`);
}

bootstrap();
