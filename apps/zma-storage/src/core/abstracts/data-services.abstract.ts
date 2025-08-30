import { ITenantGenericRepository } from '@zma-nestjs-monorepo/zma-repositories';

import { FileMetaDataEntity } from '../../frameworks/data-services/mongo/entities';

export abstract class IDataServices {
  abstract fileService: ITenantGenericRepository<FileMetaDataEntity>;
}
