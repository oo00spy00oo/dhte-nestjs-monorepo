import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { OrganizationServiceBranchStatus } from '../../../enums';

registerEnumType(OrganizationServiceBranchStatus, { name: 'OrganizationServiceBranchStatus' });

@ObjectType()
export class OrganizationServiceBranchGqlOutput {
  @Field(() => String, { name: 'id' })
  _id?: string;

  @Field()
  name!: string;

  @Field()
  address!: string;

  @Field()
  organizationId!: string;

  @Field()
  tenantId!: string;

  @Field(() => OrganizationServiceBranchStatus)
  status!: OrganizationServiceBranchStatus;

  @Field({ nullable: true })
  deletedAt?: Date;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class OrganizationServiceBranch extends OrganizationServiceBranchGqlOutput {}
