import { Schema as NestSchema, Prop, SchemaFactory } from '@nestjs/mongoose';
import {
  ServiceName,
  StorageProviderType,
  StorageStatusType,
} from '@zma-nestjs-monorepo/zma-types';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { Document, SchemaTypes } from 'mongoose';

export type FileMetaDataDocument = FileMetaDataEntity & Document;

@NestSchema({
  collection: 'file-metadata',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class FileMetaDataEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ type: SchemaTypes.String, required: true })
  originalFilename!: string;

  @Prop({ type: SchemaTypes.String, required: true })
  mimeType!: string;

  @Prop({ type: SchemaTypes.String, required: true })
  bucketKey!: string;

  @Prop({ type: SchemaTypes.String, required: true })
  bucketName!: string;

  @Prop({ type: SchemaTypes.String, enum: StorageProviderType, default: StorageProviderType.R2 })
  provider?: StorageProviderType;

  @Prop({ type: SchemaTypes.String, enum: StorageStatusType, default: StorageStatusType.Pending })
  status?: StorageStatusType;

  @Prop({ type: SchemaTypes.Number })
  sizeInBytes?: number;

  @Prop({ type: SchemaTypes.String, enum: ServiceName, required: true })
  ownerService!: ServiceName;

  @Prop({ type: SchemaTypes.UUID, required: true })
  ownerEntityId!: string;

  @Prop({ type: SchemaTypes.UUID })
  tenantId?: string;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  isDisabled?: boolean;

  @Prop({ type: SchemaTypes.Date })
  deletedAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;
}

export const FileMetaDataSchema = SchemaFactory.createForClass(FileMetaDataEntity);
