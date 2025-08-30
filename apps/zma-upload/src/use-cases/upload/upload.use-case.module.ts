import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { AppConfigModule } from '@zma-nestjs-monorepo/zma-config';
import { BullMqQueueName, ServiceName } from '@zma-nestjs-monorepo/zma-types';

import { appConfiguration } from '../../configuration';
import { FileServicesModule } from '../../frameworks/files-services/file-service.module';
import { BullMQConfigService, StorageGrpcConfigService } from '../../services/configs';
import { VirusScannerModule } from '../../services/virus-scanner/virus-scanner.module';

import { StorageClientGrpcService } from './storage-grpc-client.service';
import { UploadFactoryService } from './upload-factory.use-case.service';
import { UploadWorkerService } from './upload-worker.use-case.service';
import { UploadUseCase } from './upload.use-case';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: ServiceName.STORAGE,
        imports: [AppConfigModule],
        useClass: StorageGrpcConfigService,
      },
    ]),
    BullModule.forRootAsync({
      useClass: BullMQConfigService,
      imports: [AppConfigModule],
    }),
    BullModule.registerQueue({
      name: BullMqQueueName.FileProcessing,
    }),
    FileServicesModule,
    VirusScannerModule,
  ],
  providers: [
    {
      provide: 'APP_CONFIG',
      useFactory: (configService: ConfigService) => appConfiguration(configService),
      inject: [ConfigService],
    },
    StorageClientGrpcService,
    UploadUseCase,
    UploadFactoryService,
    UploadWorkerService,
  ],
  exports: [UploadUseCase, UploadFactoryService],
})
export class UploadUseCaseModule {}
