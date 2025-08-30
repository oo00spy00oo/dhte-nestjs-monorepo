import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  UserServiceTenantBillingStatus,
  UserServiceTenantStatus,
  UserServiceTenantType,
} from '@zma-nestjs-monorepo/zma-types';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { Document, SchemaTypes } from 'mongoose';

@Schema({ timestamps: true, collection: 'tenants' })
export class TenantEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: UserServiceTenantStatus, default: UserServiceTenantStatus.Pending })
  status: UserServiceTenantStatus;

  @Prop({
    type: String,
    enum: UserServiceTenantBillingStatus,
    default: UserServiceTenantBillingStatus.Trial,
  })
  billingStatus: UserServiceTenantBillingStatus;

  @Prop({ type: String, enum: UserServiceTenantType, default: UserServiceTenantType.Base })
  type: UserServiceTenantType;

  @Prop({ type: SchemaTypes.UUID, ref: 'Organization', required: true })
  organizationId: string;

  @Prop({ required: true })
  zaloAppId: string;

  @Prop({ required: true })
  zaloAppSecret: string;

  @Prop({ type: String, nullable: true })
  oaId?: string;

  @Prop({ type: Boolean, default: false })
  registerEnabled?: boolean;

  @Prop({ type: String, nullable: true })
  domain?: string;

  @Prop({ type: String, nullable: true })
  logo?: string;

  @Prop({ type: String, nullable: true })
  favicon?: string;

  @Prop({ type: String, nullable: true })
  description?: string;

  @Prop({ type: String, nullable: true })
  title?: string;

  @Prop({ type: String, nullable: true })
  banner?: string;

  @Prop({ type: String, nullable: true })
  miniAppUrl?: string;

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: Date, nullable: true })
  deletedAt?: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export type TenantDocument = TenantEntity & Document;
export const TenantSchema = SchemaFactory.createForClass(TenantEntity);
