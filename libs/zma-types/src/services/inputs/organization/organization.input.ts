import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { Pagination } from '../../../common';

@InputType()
export class OrganizationServiceGetOrganizationsGqlInput extends Pagination {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

@InputType()
export class OrganizationServiceCreateOrganizationGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  name!: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  logo?: string;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  isEnterprise?: boolean;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  domain?: string;
}

@InputType()
export class OrganizationServiceUpdateOrganizationGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  name!: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  logo?: string;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  isEnterprise?: boolean;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  domain?: string;
}
