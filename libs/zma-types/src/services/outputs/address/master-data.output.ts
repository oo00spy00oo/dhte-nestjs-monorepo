import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AddressServiceProvinceGqlOutput {
  @Field(() => String)
  id!: string;

  @Field()
  name!: string;

  @Field()
  code!: string;
}

@ObjectType()
export class AddressServiceWardGqlOutput {
  @Field(() => String)
  id!: string;

  @Field()
  name!: string;

  @Field()
  type!: string;

  @Field()
  code!: string;

  @Field()
  provinceId!: string;
}

@ObjectType()
export class AddressServiceCountryGqlOutput {
  @Field()
  id!: string;

  @Field()
  code!: string;

  @Field()
  name!: string;
}

export class AddressServiceProvince extends AddressServiceProvinceGqlOutput {}

export class AddressServiceWard extends AddressServiceWardGqlOutput {}

export class AddressServiceCountry extends AddressServiceCountryGqlOutput {}
