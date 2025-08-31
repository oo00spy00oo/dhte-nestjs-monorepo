import { Mutation, Resolver, Args } from '@nestjs/graphql';
import { CurrentTenant, CurrentUser } from '@zma-nestjs-monorepo/zma-decorators';
import { AuthenticatedUser } from '@zma-nestjs-monorepo/zma-types';

import {
  NotificationServiceCreateTemplateGqlInput,
  NotificationServiceUpdateTemplateGqlInput,
} from '../../core/inputs';
import {
  NotificationServiceInAppNotificationGqlOutput,
  NotificationServiceTemplateGqlOutput,
} from '../../core/outputs';
import { InAppChannelUseCase } from '../../use-cases/notification-channels/in-app/in-app-channel.use-case';
import { TemplateUseCase } from '../../use-cases/template/template.use-case';

@Resolver()
export class NotificationMutation {
  constructor(
    private inAppChannelUseCase: InAppChannelUseCase,
    private templateUseCase: TemplateUseCase,
  ) {}

  @Mutation(() => NotificationServiceInAppNotificationGqlOutput)
  async notificationServiceMarkInAppNotificationAsRead(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Args('id') id: string,
  ): Promise<NotificationServiceInAppNotificationGqlOutput> {
    return this.inAppChannelUseCase.markInAppNotificationAsRead({
      userId: user.id,
      tenantId,
      id,
    });
  }

  // Admin only
  @Mutation(() => NotificationServiceTemplateGqlOutput)
  async notificationServiceCreateTemplateForAdmin(
    @CurrentTenant() tenantId: string,
    @Args('input') input: NotificationServiceCreateTemplateGqlInput,
  ): Promise<NotificationServiceTemplateGqlOutput> {
    return this.templateUseCase.createTemplate({
      tenantId,
      input,
    });
  }

  // Admin only
  @Mutation(() => NotificationServiceTemplateGqlOutput)
  async notificationServiceUpdateTemplateForAdmin(
    @CurrentTenant() tenantId: string,
    @Args('id') id: string,
    @Args('input') input: NotificationServiceUpdateTemplateGqlInput,
  ): Promise<NotificationServiceTemplateGqlOutput> {
    return this.templateUseCase.updateTemplate({
      tenantId,
      id,
      input,
    });
  }
}
