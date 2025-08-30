import { SharedBullConfigurationFactory, BullRootModuleOptions } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '@zma-nestjs-monorepo/zma-config';

@Injectable()
export class BullMQConfigService implements SharedBullConfigurationFactory {
  constructor(private readonly appConfigService: AppConfigService) {}

  createSharedConfiguration(): BullRootModuleOptions {
    return {
      connection: {
        host: this.appConfigService.getRedisHost,
        port: this.appConfigService.getRedisPort,
      },
      prefix: '{bullmq}',
    };
  }
}
