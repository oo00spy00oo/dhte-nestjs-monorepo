import {
  IGenericRepository,
  ITenantGenericRepository,
} from '@zma-nestjs-monorepo/zma-repositories';

import { TenantEntity, UserEntity } from '../../frameworks/data-services/mongo/entities';

export abstract class IDataServices {
  abstract tenantService: IGenericRepository<TenantEntity>;
  abstract userService: ITenantGenericRepository<UserEntity>;
}
