import { Field, GraphQLISODateTime, ObjectType, registerEnumType } from '@nestjs/graphql';

import { ServiceName } from '../../../enums';
import { StorageProviderType, StorageStatusType } from '../../../types';

registerEnumType(StorageProviderType, {
  name: 'StorageProviderType',
});

registerEnumType(StorageStatusType, {
  name: 'StorageStatusType',
});

@ObjectType()
export class StorageServiceFileMetadataGqlOutput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  tenantId?: string;

  @Field(() => String, { nullable: true })
  mimeType?: string;

  @Field(() => String, { nullable: true })
  bucketKey?: string;

  @Field(() => String, { nullable: true })
  bucketName?: string;

  @Field(() => StorageProviderType, { nullable: true })
  provider?: StorageProviderType;

  @Field(() => StorageStatusType, { nullable: true })
  status?: StorageStatusType;

  @Field(() => Number, { nullable: true })
  sizeInBytes?: number;

  @Field(() => ServiceName, { nullable: true })
  ownerService?: ServiceName;

  @Field(() => String, { nullable: true })
  ownerEntityId?: string;

  @Field(() => GraphQLISODateTime)
  createdAt?: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt?: Date;
}

export class StorageServiceFileMetadataOutput extends StorageServiceFileMetadataGqlOutput {}
