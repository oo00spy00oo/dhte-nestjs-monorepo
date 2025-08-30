import { Field, ObjectType } from '@nestjs/graphql';
import { StorageProviderType, StorageStatusType } from '@zma-nestjs-monorepo/zma-types';
import { IsBoolean, IsEnum, IsString } from 'class-validator';

@ObjectType()
export class UploadServiceRequestGqlOutput {
  @Field(() => String)
  fileId!: string;

  @Field(() => String)
  uploadUrl!: string;
}

@ObjectType()
export class UploadServiceCompleteGqlOutput {
  @Field(() => String)
  fileUrl!: string;

  @Field(() => StorageStatusType)
  status!: StorageStatusType;
}

export class FileServiceGetPermanentBucketOutput {
  @IsString()
  bucket!: string;

  @IsEnum(StorageProviderType)
  provider!: StorageProviderType;
}

export class VirusScanOutput {
  @IsBoolean()
  isClean: boolean;

  @IsBoolean()
  isInfected?: boolean; // True if a virus was found

  @IsString({ each: true })
  viruses?: string[]; // List of detected viruses

  @IsString()
  error?: string; // Error message if the scan itself failed
}
