import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { Pagination, SortDirection } from '../../../common';
import {
  OrganizationServiceBranchSortField,
  OrganizationServiceBranchStatus,
} from '../../../enums';

registerEnumType(OrganizationServiceBranchSortField, {
  name: 'OrganizationServiceBranchSortField',
});

@InputType()
export class OrganizationServiceCreateBranchGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  name!: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  address!: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => OrganizationServiceBranchStatus)
  status!: OrganizationServiceBranchStatus;
}

@InputType()
export class OrganizationServiceUpdateBranchGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  name!: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  address!: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => OrganizationServiceBranchStatus)
  status!: OrganizationServiceBranchStatus;
}

@InputType()
export class OrganizationServiceGetBranchesGqlInput extends Pagination {
  @Field(() => OrganizationServiceBranchStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrganizationServiceBranchStatus)
  status?: OrganizationServiceBranchStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => OrganizationServiceBranchSortField, { nullable: true })
  @IsOptional()
  @IsEnum(OrganizationServiceBranchSortField)
  sortBy?: OrganizationServiceBranchSortField;

  @Field(() => SortDirection, { nullable: true })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection;
}
