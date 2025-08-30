import { MicroserviceInput, StorageServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import {
  StorageServiceInputMapper,
  StorageServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/storage';
import { Observable } from 'rxjs';

export interface StorageService {
  storageServiceGetFileMetadataById(
    input: MicroserviceInput<StorageServiceInputMapper<StorageServiceSubject.GetFileMetadataById>>,
  ): Observable<StorageServiceOutputMapper<StorageServiceSubject.GetFileMetadataById>>;

  storageServiceCreateFileMetadata(
    input: MicroserviceInput<StorageServiceInputMapper<StorageServiceSubject.CreateFileMetadata>>,
  ): Observable<StorageServiceOutputMapper<StorageServiceSubject.CreateFileMetadata>>;

  storageServiceUpdateFileMetadata(
    input: MicroserviceInput<StorageServiceInputMapper<StorageServiceSubject.UpdateFileMetadata>>,
  ): Observable<StorageServiceOutputMapper<StorageServiceSubject.UpdateFileMetadata>>;
}
