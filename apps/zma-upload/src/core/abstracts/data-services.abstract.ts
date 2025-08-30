import { ITenantGenericRepository } from '@zma-nestjs-monorepo/zma-repositories';

import { CompanyEntity } from '../../frameworks/data-services/mongo/entities';

export abstract class IDataServices {
  abstract companyService: ITenantGenericRepository<CompanyEntity>;
}
