import { Injectable } from '@nestjs/common';
import { StorageServiceFileMetadataGqlOutput } from '@zma-nestjs-monorepo/zma-types/outputs/storage';
import _ from 'lodash';

import { FileMetaDataEntity } from '../../frameworks/data-services/mongo/entities';

@Injectable()
export class FileFactoryService {
  transform(entity: FileMetaDataEntity): StorageServiceFileMetadataGqlOutput {
    return _.assign(entity);
  }
}
