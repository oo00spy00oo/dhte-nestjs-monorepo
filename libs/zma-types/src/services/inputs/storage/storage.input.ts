import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';

import { ServiceName } from '../../../enums';
import { StorageProviderType, StorageStatusType } from '../../../types';

export class StorageServiceGetFileMetadataByIdInput {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;
}

export class StorageServiceCreateFileMetadataInput {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  originalFilename!: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsString()
  @IsNotEmpty()
  bucketKey!: string;

  @IsString()
  @IsNotEmpty()
  bucketName!: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(StorageProviderType)
  provider!: StorageProviderType;

  @IsEnum(StorageStatusType)
  status!: StorageStatusType;

  @IsInt()
  sizeInBytes?: number;

  @IsEnum(ServiceName)
  @IsNotEmpty()
  ownerService!: ServiceName;

  @IsString()
  @IsNotEmpty()
  ownerEntityId!: string;
}

export class StorageServiceUpdateFileMetadataInput {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsNotEmpty()
  @IsString()
  tenantId!: string;

  @IsString()
  originalFilename?: string;

  @IsString()
  mimeType?: string;

  @IsString()
  bucketKey?: string;

  @IsString()
  bucketName?: string;

  @IsEnum(StorageProviderType)
  provider?: StorageProviderType;

  @IsEnum(StorageStatusType)
  status?: StorageStatusType;

  @IsInt()
  sizeInBytes?: number;

  @IsEnum(ServiceName)
  ownerService?: ServiceName;

  @IsString()
  ownerEntityId?: string;
}
