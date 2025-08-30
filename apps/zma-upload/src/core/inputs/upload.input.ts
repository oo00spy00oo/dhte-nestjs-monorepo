import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import {
  ServiceName,
  StorageProviderType,
  StorageStatusType,
} from '@zma-nestjs-monorepo/zma-types';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

registerEnumType(StorageStatusType, {
  name: 'StorageStatusType',
});
@InputType()
export class UploadServiceRequestGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  mimeType!: string;

  @IsEnum(ServiceName)
  @IsNotEmpty()
  @Field(() => ServiceName)
  ownerService!: ServiceName;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  ownerEntityId!: string;
}

@InputType()
export class UploadServiceCompleteGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  fileId!: string;
}

export class FileServiceGeneralInput {
  @IsString()
  @IsNotEmpty()
  bucket!: string;

  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsEnum(() => StorageProviderType)
  @IsNotEmpty()
  providerType?: StorageProviderType;
}

export class FileServiceUploadInput extends FileServiceGeneralInput {
  @IsString()
  @IsNotEmpty()
  file!: Buffer | Uint8Array | Blob | string | ReadableStream;
}

export class QueueServiceFileProcessingInput {
  @IsString()
  @IsNotEmpty()
  fileId!: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;
}
