import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KafkaTopic } from '@zma-nestjs-monorepo/zma-types';
import { UserServiceEventInputMapper } from '@zma-nestjs-monorepo/zma-types/mappers/user';

import { UserUseCase } from '../../use-cases/user/user.use-case';

@Controller()
export class UserKafkaController {
  private readonly logger = new Logger(UserKafkaController.name);

  constructor(private readonly userUseCase: UserUseCase) {}

  @EventPattern(KafkaTopic.UserActivityEventTopic)
  async handleUserActivityEvent(
    @Payload() data: UserServiceEventInputMapper<KafkaTopic.UserActivityEventTopic>,
  ): Promise<void> {
    try {
      this.logger.log(`Received user activity event: ${JSON.stringify(data)}`);

      const activityTimestamp = new Date(data.activityTimestamp);

      await this.userUseCase.updateUserActivity({
        userId: data.userId,
        tenantId: data.tenantId,
        activityTimestamp,
      });

      this.logger.log(`Successfully updated user activity for user: ${data.userId}`);
    } catch (error) {
      this.logger.error('Error handling user activity event:', error);
    }
  }
}
