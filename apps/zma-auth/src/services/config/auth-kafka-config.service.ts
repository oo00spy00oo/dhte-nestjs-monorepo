import { Injectable, Logger } from '@nestjs/common';
import { ClientProvider, ClientsModuleOptionsFactory, Transport } from '@nestjs/microservices';
import { AppConfigService } from '@zma-nestjs-monorepo/zma-config';
import { KafkaClient } from '@zma-nestjs-monorepo/zma-types';

@Injectable()
export class AuthKafkaConfigService implements ClientsModuleOptionsFactory {
  private readonly logger = new Logger(AuthKafkaConfigService.name);
  constructor(private readonly configService: AppConfigService) {}

  createClientOptions(): ClientProvider {
    const kafkaBrokers = this.configService.getKafkaBrokers;
    this.logger.log(`🚀 Kafka Brokers: ${kafkaBrokers}`);
    return {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: KafkaClient.AuthService,
          brokers: kafkaBrokers,
        },
      },
    };
  }
}
