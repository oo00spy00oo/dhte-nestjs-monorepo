import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import {
  UserServiceTenantBillingStatus,
  UserServiceTenantStatus,
  UserServiceTenantType,
} from '../../../enums';

registerEnumType(UserServiceTenantStatus, { name: 'UserServiceTenantStatus' });
registerEnumType(UserServiceTenantBillingStatus, { name: 'UserServiceTenantBillingStatus' });
registerEnumType(UserServiceTenantType, { name: 'UserServiceTenantType' });

@ObjectType()
export class UserServiceTenantGqlOutput {
  @Field(() => String, { name: 'id' })
  _id?: string;

  @Field()
  name!: string;

  @Field(() => UserServiceTenantStatus)
  status!: UserServiceTenantStatus;

  @Field(() => UserServiceTenantBillingStatus)
  billingStatus!: UserServiceTenantBillingStatus;

  @Field(() => UserServiceTenantType)
  type!: UserServiceTenantType;

  @Field()
  organizationId!: string;

  @Field()
  zaloAppId!: string;

  @Field()
  zaloAppSecret!: string;

  @Field(() => String, { nullable: true })
  oaId?: string;

  @Field({ nullable: true })
  registerEnabled?: boolean;

  @Field(() => String, { nullable: true })
  domain?: string;

  @Field({ nullable: true })
  logo?: string;

  @Field(() => String, { nullable: true })
  favicon?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  banner?: string;

  @Field({ nullable: true })
  miniAppUrl?: string;

  @Field({ nullable: true })
  createdAt?: string;

  @Field({ nullable: true })
  updatedAt?: string;
}

@ObjectType()
export class UserServiceTenant extends UserServiceTenantGqlOutput {}
