import { Injectable, Logger } from '@nestjs/common';
import { ClientsModuleOptionsFactory, ClientProvider, Transport } from '@nestjs/microservices';
import { AppConfigService } from '@zma-nestjs-monorepo/zma-config';
import { KafkaClient } from '@zma-nestjs-monorepo/zma-types';

@Injectable()
export class KafkaConfigService implements ClientsModuleOptionsFactory {
  constructor(private readonly appConfigService: AppConfigService) {}
  createClientOptions(): ClientProvider {
    const kafkaBrokers = this.appConfigService.getKafkaBrokers;
    Logger.log(`🚀 Kafka broker url: ${kafkaBrokers}`);
    return {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: KafkaClient.LarvaCourseService,
          brokers: kafkaBrokers,
        },
      },
    };
  }
}
