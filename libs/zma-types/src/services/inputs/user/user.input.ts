import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { Pagination, SortDirection } from '../../../common/inputs';
import {
  UserServiceUserSortField,
  UserServiceUserStatus,
  UserServiceUserType,
} from '../../../enums/services/user.enum';

registerEnumType(UserServiceUserSortField, { name: 'UserServiceUserSortField' });

@InputType()
export class UserServiceCreateBasicUserGqlInput {
  @Field(() => String)
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  password!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;
}

@InputType()
export class UserServiceCreateUserGqlInput extends UserServiceCreateBasicUserGqlInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  organizationId!: string;
}

export class UserServiceSocialProvider {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  email!: string;
}

export class UserServiceSocialProviders {
  @Field(() => UserServiceSocialProvider, { nullable: true })
  google?: UserServiceSocialProvider;

  @Field(() => UserServiceSocialProvider, { nullable: true })
  facebook?: UserServiceSocialProvider;
}

export class UserServiceCreateUserSubjectInput {
  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  zaloId?: string;

  @IsString()
  @IsOptional()
  tenantId?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEnum(UserServiceUserType)
  @IsOptional()
  type?: UserServiceUserType;

  @IsOptional()
  @IsString()
  verificationCode?: string;

  @IsOptional()
  socialProviders?: UserServiceSocialProviders;
}

export class UserServiceCreateZaloUserSubjectInput {
  @IsString()
  @IsNotEmpty()
  zaloId!: string;

  @IsString()
  @IsNotEmpty()
  avatarUrl!: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;
}

export class UserServiceUpdateUserSubjectInput {
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  resetToken?: string;

  @IsString()
  @IsOptional()
  resetTokenExpiry?: string;

  @IsNumber()
  @IsOptional()
  failedLoginAttempts?: number;

  @IsString()
  @IsOptional()
  verificationCode?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  email?: string;
}

export class UserServiceFindByEmailSubjectInput {
  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;
}

export class UserServiceFindByZaloIdAndTenantIdSubjectInput {
  @IsString()
  @IsNotEmpty()
  zaloId!: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;
}

export class UserServiceUpdateProfileSubjectInput {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

export class FindZaloUsersByTenantIdInput {
  @IsString()
  @IsNotEmpty()
  tenantId!: string;
}

export class UserServiceUpdateStatusInput {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  status!: string;
}

@InputType()
export class UserServiceConfirmByCodeInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  code!: string;
}

@InputType()
export class UserServiceGetZaloUsersGqlInput extends Pagination {
  @Field(() => UserServiceUserStatus, { nullable: true })
  @IsOptional()
  @IsEnum(UserServiceUserStatus)
  status?: UserServiceUserStatus;

  @Field(() => UserServiceUserSortField, { nullable: true })
  @IsOptional()
  @IsEnum(UserServiceUserSortField)
  sortBy?: UserServiceUserSortField;

  @Field(() => SortDirection, { nullable: true })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

@InputType()
export class UserServiceFindUsersForAdminInput {
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsEmail({}, { each: true })
  emails?: string[];

  @Field(() => [UserServiceUserStatus], { nullable: true })
  @IsOptional()
  @IsEnum(UserServiceUserStatus, { each: true })
  statuses?: UserServiceUserStatus[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

@InputType()
export class UserServiceFindUsersByTypeInput extends UserServiceFindUsersForAdminInput {
  @Field(() => UserServiceUserType)
  @IsNotEmpty()
  @IsEnum(UserServiceUserType)
  type!: UserServiceUserType;
}
