import { IGenericRepository } from '@zma-nestjs-monorepo/zma-repositories';

import { DictionaryEntity } from '../../frameworks/data-services/mongo/entities';

export abstract class IDataServices {
  abstract dictionaryService: IGenericRepository<DictionaryEntity>;
}
