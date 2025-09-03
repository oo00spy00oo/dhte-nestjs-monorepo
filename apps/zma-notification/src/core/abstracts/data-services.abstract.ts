import { ITenantGenericRepository } from '@zma-nestjs-monorepo/zma-repositories';

import {
  InAppNotificationEntity,
  TemplateEntity,
} from '../../frameworks/data-services/mongo/entities';

export abstract class IDataServices {
  abstract inAppNotificationService: ITenantGenericRepository<InAppNotificationEntity>;
  abstract templateService: ITenantGenericRepository<TemplateEntity>;
}
