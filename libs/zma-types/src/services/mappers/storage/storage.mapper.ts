import { StorageServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import {
  StorageServiceCreateFileMetadataInput,
  StorageServiceGetFileMetadataByIdInput,
  StorageServiceUpdateFileMetadataInput,
} from '../../inputs/storage';
import { StorageServiceFileMetadataOutput } from '../../outputs/storage';

interface StorageServiceMapper {
  [StorageServiceSubject.GetFileMetadataById]: {
    input: StorageServiceGetFileMetadataByIdInput;
    output: StorageServiceFileMetadataOutput;
  };
  [StorageServiceSubject.CreateFileMetadata]: {
    input: StorageServiceCreateFileMetadataInput;
    output: StorageServiceFileMetadataOutput;
  };
  [StorageServiceSubject.UpdateFileMetadata]: {
    input: StorageServiceUpdateFileMetadataInput;
    output: StorageServiceFileMetadataOutput;
  };
}

export type StorageServiceInputMapper<T extends StorageServiceSubject> =
  StorageServiceMapper[T][KeyMapper.Input];

export type StorageServiceOutputMapper<T extends StorageServiceSubject> =
  StorageServiceMapper[T][KeyMapper.Output];
