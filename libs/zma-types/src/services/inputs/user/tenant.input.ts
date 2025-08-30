import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { Pagination, SortDirection } from '../../../common';
import {
  UserServiceTenantSortField,
  UserServiceTenantStatus,
  UserServiceTenantType,
} from '../../../enums';

registerEnumType(UserServiceTenantSortField, { name: 'UserServiceTenantSortField' });
registerEnumType(UserServiceTenantType, { name: 'UserServiceTenantType' });

@InputType()
export class UserServiceCreateTenantGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  name!: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  zaloAppId!: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  zaloAppSecret!: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  oaId?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  domain?: string;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  registerEnabled?: boolean;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  favicon?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  description?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  title?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  banner?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  miniAppUrl?: string;
}

@InputType()
export class UserServiceUpdateTenantGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  id!: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  name!: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  zaloAppId!: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  zaloAppSecret!: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  oaId?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  logo?: string;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  registerEnabled?: boolean;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  domain?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  favicon?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  description?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  title?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  banner?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  miniAppUrl?: string;
}

@InputType()
export class UserServiceTenantStatusGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  id!: string;

  @IsNotEmpty()
  @IsEnum(UserServiceTenantStatus)
  @Field(() => UserServiceTenantStatus)
  status!: UserServiceTenantStatus;
}

@InputType()
export class UserServiceTenantTypeGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  id!: string;

  @IsNotEmpty()
  @IsEnum(UserServiceTenantType)
  @Field(() => UserServiceTenantType)
  type!: UserServiceTenantType;
}

export class UserServiceCreateTenantInput extends UserServiceCreateTenantGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  userId!: string;
}

export class UserServiceUpdateTenantInput extends UserServiceUpdateTenantGqlInput {
  @IsNotEmpty()
  @IsString()
  userId!: string;
}

@InputType()
export class UserServiceGetTenantsGqlInput extends Pagination {
  @Field(() => UserServiceTenantSortField, { nullable: true })
  @IsOptional()
  @IsEnum(UserServiceTenantSortField)
  sortBy?: UserServiceTenantSortField;

  @Field(() => SortDirection, { nullable: true })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection;

  @Field(() => UserServiceTenantStatus, { nullable: true })
  @IsOptional()
  @IsEnum(UserServiceTenantStatus)
  status?: UserServiceTenantStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;
}
