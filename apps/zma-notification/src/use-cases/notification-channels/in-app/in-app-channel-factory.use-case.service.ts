import { Injectable } from '@nestjs/common';

import { NotificationServiceInAppNotificationGqlOutput } from '../../../core/outputs';
import { InAppNotificationEntity } from '../../../frameworks/data-services/mongo/entities';

@Injectable()
export class InAppChannelFactoryService {
  transformInAppNotification(
    entity: InAppNotificationEntity,
  ): NotificationServiceInAppNotificationGqlOutput {
    const notification: NotificationServiceInAppNotificationGqlOutput = {
      _id: entity._id,
      tenantId: entity.tenantId,
      userId: entity.userId,
      title: entity.title,
      content: entity.content,
      isRead: entity.isRead,
      readAt: entity.readAt,
      metadata: entity.metadata,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    return notification;
  }
}
