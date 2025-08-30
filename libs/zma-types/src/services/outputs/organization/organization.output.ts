import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { OrganizationServiceOrganizationStatus } from '../../../enums';

registerEnumType(OrganizationServiceOrganizationStatus, {
  name: 'OrganizationServiceOrganizationStatus',
});

@ObjectType()
export class OrganizationServiceOrganizationGqlOutput {
  @Field(() => String, { name: 'id' })
  _id?: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  isEnterprise?: boolean;

  @Field({ nullable: true })
  domain?: string;

  @Field(() => OrganizationServiceOrganizationStatus)
  status!: OrganizationServiceOrganizationStatus;

  @Field()
  createdBy!: string;

  @Field({ nullable: true })
  deletedAt?: Date;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class OrganizationServiceOrganization extends OrganizationServiceOrganizationGqlOutput {}
