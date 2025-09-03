import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KafkaTopic } from '@zma-nestjs-monorepo/zma-types';
import { UserServiceEventInputMapper } from '@zma-nestjs-monorepo/zma-types/mappers/user';

import { NotificationUseCase } from '../use-cases/notification/notification.use-case';
@Controller()
export class KafkaController {
  private readonly logger = new Logger(KafkaController.name);
  constructor(private readonly notificationUseCase: NotificationUseCase) {}

  @EventPattern(KafkaTopic.UserCreatedEventTopic)
  async handleUserCreatedEvent(
    @Payload() data: UserServiceEventInputMapper<KafkaTopic.UserCreatedEventTopic>,
  ): Promise<void> {
    try {
      await this.notificationUseCase.handleUserCreatedEvent(data);
    } catch (error) {
      this.logger.error('Error handling user created event:', error);
    }
  }

  @EventPattern(KafkaTopic.UserForgotPasswordEventTopic)
  async handleUserForgotPasswordEvent(
    @Payload() data: UserServiceEventInputMapper<KafkaTopic.UserForgotPasswordEventTopic>,
  ): Promise<void> {
    try {
      await this.notificationUseCase.handleUserForgotPasswordEvent(data);
    } catch (error) {
      this.logger.error('Error handling user forgot password event:', error);
    }
  }
}
