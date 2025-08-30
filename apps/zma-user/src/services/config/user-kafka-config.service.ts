import { Injectable, Logger } from '@nestjs/common';
import { ClientProvider, ClientsModuleOptionsFactory, Transport } from '@nestjs/microservices';
import { AppConfigService } from '@zma-nestjs-monorepo/zma-config';
import { KafkaClient } from '@zma-nestjs-monorepo/zma-types';

@Injectable()
export class UserKafkaConfigService implements ClientsModuleOptionsFactory {
  private readonly logger = new Logger(UserKafkaConfigService.name);
  constructor(private readonly appConfigService: AppConfigService) {}

  createClientOptions(): ClientProvider {
    const kafkaBrokers = this.appConfigService.getKafkaBrokers;
    this.logger.log(`🚀 Kafka Brokers: ${kafkaBrokers}`);

    return {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: KafkaClient.UserService,
          brokers: kafkaBrokers,
        },
      },
    };
  }
}
