import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  UserServiceGender,
  UserServiceUserStatus,
  UserServiceUserType,
} from '@zma-nestjs-monorepo/zma-types';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { Document, SchemaTypes } from 'mongoose';

@Schema({ timestamps: true, collection: 'users' })
export class UserEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ nullable: true, lowercase: true, unique: true })
  email?: string;

  @Prop({ nullable: true })
  password?: string;

  @Prop({ nullable: true })
  zaloId?: string;

  @Prop({ nullable: true })
  zaloOAId?: string;

  @Prop({ nullable: true })
  firstName?: string;

  @Prop({ nullable: true })
  lastName?: string;

  @Prop({ type: String, enum: UserServiceUserType, default: UserServiceUserType.User })
  type: UserServiceUserType;

  @Prop({ type: String, enum: UserServiceUserStatus, default: UserServiceUserStatus.Pending })
  status: UserServiceUserStatus;

  @Prop({ type: SchemaTypes.UUID, ref: 'Tenant', nullable: true })
  tenantId?: string;

  @Prop({ type: SchemaTypes.UUID, ref: 'Organization', nullable: true })
  organizationId?: string;

  @Prop({ type: Object, nullable: true })
  socialProviders?: {
    google?: {
      id: string;
      email: string;
      accessToken?: string;
    };
    facebook?: {
      id: string;
      email: string;
      accessToken?: string;
    };
  };

  @Prop({ type: String, nullable: true })
  resetToken?: string;

  @Prop({ type: Date, nullable: true })
  resetTokenExpiry?: Date;

  @Prop({ type: String, nullable: true })
  avatarUrl?: string;

  @Prop({ type: String, nullable: true })
  phoneNumber?: string;

  @Prop({ type: Date, nullable: true })
  birthDate?: Date;

  @Prop({ type: String, enum: UserServiceGender, nullable: true })
  gender?: UserServiceGender;

  @Prop({ type: Number, default: 0 })
  failedLoginAttempts?: number;

  @Prop({ type: String, nullable: true })
  verificationCode?: string;

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: Date, nullable: true })
  deletedAt?: Date;

  @Prop({ type: SchemaTypes.UUID, ref: 'User', nullable: true })
  createdBy?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;

  @Prop({ type: Date, nullable: true })
  lastActive?: Date;
}

export type UserDocument = UserEntity & Document;
// create index for email, status, tenantId
export const UserSchema = SchemaFactory.createForClass(UserEntity);
UserSchema.index({ email: 1, status: 1, tenantId: 1 });
