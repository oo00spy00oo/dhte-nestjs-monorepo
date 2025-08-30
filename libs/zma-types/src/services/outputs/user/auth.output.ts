import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokenVerifyGqlOutput {
  @Field()
  id!: string;

  @Field()
  sub!: string;

  @Field()
  email!: string;

  @Field()
  zaloId!: string;

  @Field({ nullable: true })
  organizationId?: string;

  @Field(() => [String], { nullable: true })
  roles?: string[];

  @Field()
  type!: string;

  // based on user type to check user is admin or zalo user
  @Field(() => [String], { nullable: true })
  tenantIds?: string[];
}
