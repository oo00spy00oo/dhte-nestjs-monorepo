import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentTenant, CurrentUser } from '@zma-nestjs-monorepo/zma-decorators';
import { AuthenticatedUser, Pagination } from '@zma-nestjs-monorepo/zma-types';

import {
  NotificationServiceInAppNotificationGqlOutput,
  NotificationServiceTemplateGqlOutput,
} from '../../core/outputs';
import { InAppChannelUseCase } from '../../use-cases/notification-channels/in-app/in-app-channel.use-case';
import { TemplateUseCase } from '../../use-cases/template/template.use-case';
import { CacheKeys } from '../../utils';

@Resolver()
export class NotificationResolver {
  constructor(
    private inAppChannelUseCase: InAppChannelUseCase,
    private templateUseCase: TemplateUseCase,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Query(() => [NotificationServiceInAppNotificationGqlOutput])
  async notificationServiceInAppNotifications(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Args('pagination') pagination: Pagination,
  ): Promise<NotificationServiceInAppNotificationGqlOutput[]> {
    const { id: userId } = user;
    return this.inAppChannelUseCase.getInAppNotifications({
      userId,
      tenantId,
      pagination,
    });
  }

  // Admin only
  @Query(() => [NotificationServiceTemplateGqlOutput])
  async notificationServiceTemplates(
    @CurrentTenant() tenantId: string,
    @Args('pagination') pagination: Pagination,
  ): Promise<NotificationServiceTemplateGqlOutput[]> {
    const cacheKey = CacheKeys.template.list({
      tenantId,
      pagination,
    });
    return await this.cacheManager.wrap<NotificationServiceTemplateGqlOutput[]>(
      cacheKey,
      async () => await this.templateUseCase.getTemplates({ tenantId, pagination }),
      60,
    );
  }

  // Admin only
  @Query(() => NotificationServiceTemplateGqlOutput)
  async notificationServiceTemplate(
    @CurrentTenant() tenantId: string,
    @Args('id') id: string,
  ): Promise<NotificationServiceTemplateGqlOutput> {
    const cacheKey = CacheKeys.template.id({
      tenantId,
      id,
    });
    return await this.cacheManager.wrap<NotificationServiceTemplateGqlOutput>(
      cacheKey,
      async () => await this.templateUseCase.getTemplateById({ tenantId, id }),
      60,
    );
  }
}
