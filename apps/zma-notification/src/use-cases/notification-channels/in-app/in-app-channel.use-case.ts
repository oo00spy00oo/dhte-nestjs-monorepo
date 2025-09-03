import { Injectable, Logger } from '@nestjs/common';
import { Exception } from '@zma-nestjs-monorepo/zma-middlewares';
import { ErrorCode, Pagination } from '@zma-nestjs-monorepo/zma-types';

import { IDataServices } from '../../../core/abstracts';
import { NotificationServiceCreateInAppNotificationGqlInput } from '../../../core/inputs';
import { NotificationServiceInAppNotificationGqlOutput } from '../../../core/outputs';

import { InAppChannelFactoryService } from './in-app-channel-factory.use-case.service';

@Injectable()
export class InAppChannelUseCase {
  private readonly logger = new Logger(InAppChannelUseCase.name);

  constructor(
    private readonly factoryService: InAppChannelFactoryService,
    private readonly dataServices: IDataServices,
  ) {}

  async getInAppNotifications({
    userId,
    tenantId,
    pagination,
  }: {
    userId: string;
    tenantId: string;
    pagination: Pagination;
  }): Promise<NotificationServiceInAppNotificationGqlOutput[]> {
    const { skip, limit } = pagination;
    const notificationEntities = await this.dataServices.inAppNotificationService.findMany({
      tenantId,
      find: {
        filter: {
          userId,
          isDeleted: false,
        },
      },
      options: { skip, limit, sort: { createdAt: -1 } },
    });

    return notificationEntities.map((entity) =>
      this.factoryService.transformInAppNotification(entity),
    );
  }

  async markInAppNotificationAsRead({
    userId,
    tenantId,
    id,
  }: {
    userId: string;
    tenantId: string;
    id: string;
  }): Promise<NotificationServiceInAppNotificationGqlOutput> {
    const existingNotification = await this.dataServices.inAppNotificationService.findOne({
      tenantId,
      find: {
        filter: {
          _id: id,
          userId,
          isRead: false,
          readAt: { $exists: false },
          isDeleted: false,
        },
      },
    });
    if (!existingNotification) {
      throw new Exception(ErrorCode.IN_APP_NOTIFICATION_NOT_FOUND);
    }

    const updatedInAppNotification = await this.dataServices.inAppNotificationService.updateOne({
      tenantId,
      id: existingNotification._id,
      update: {
        item: {
          isRead: true,
          readAt: new Date(),
        },
      },
    });

    if (!updatedInAppNotification) {
      throw new Exception(ErrorCode.UPDATE_IN_APP_NOTIFICATION_FAILED);
    }

    return this.factoryService.transformInAppNotification(updatedInAppNotification);
  }

  async createInAppNotification({
    tenantId,
    userId,
    input,
  }: {
    tenantId: string;
    userId: string;
    input: NotificationServiceCreateInAppNotificationGqlInput;
  }): Promise<NotificationServiceInAppNotificationGqlOutput> {
    const entityData = {
      ...input,
      tenantId,
      userId,
    };

    const inAppNotificationEntity = await this.dataServices.inAppNotificationService.create({
      tenantId,
      item: entityData,
    });

    if (!inAppNotificationEntity) {
      throw new Exception(ErrorCode.CREATE_IN_APP_NOTIFICATION_FAILED);
    }

    return this.factoryService.transformInAppNotification(inAppNotificationEntity);
  }
}
