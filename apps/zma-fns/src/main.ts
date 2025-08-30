import { join } from 'path';

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

  // Connect to gRPC
  const grpcUrl = configService.getGrpcUrl;
  Logger.log(`Connecting to gRPC at ${grpcUrl}`);
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      url: grpcUrl,
      package: ServiceName.FNS,
      protoPath: join(__dirname, 'src/proto/fns.proto'),
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

  const host = process.env.HOST || '0.0.0.0';
  const port = process.env.PORT || 3000;

  Logger.log('Starting Microservices');
  await app.startAllMicroservices();
  Logger.log('Microservices started');

  await app.listen(port, host);
  if (configService.get('NODE_ENV') === 'development') {
    Logger.log(figlet.textSync('zma-fns !'));
  }
  Logger.log(`🚀 Application is running on: http://${host}:${port}/graphql`);
}

bootstrap();
