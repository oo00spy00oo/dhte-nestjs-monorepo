import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('PointExpiryRule')
export class PointServicePointExpiryRuleGqlOutput {
  @Field(() => ID, { nullable: true })
  _id?: string;

  @Field()
  tenantId!: string;

  @Field()
  loyaltyProgramId!: string;

  @Field()
  name!: string;

  @Field(() => String)
  expiryType!: string;

  @Field(() => Int)
  daysValid?: number;

  @Field(() => Date, { nullable: true })
  fixedDate?: Date;

  @Field(() => [String])
  applicableTiers?: string[];

  @Field(() => Boolean)
  isActive?: boolean;

  @Field(() => String)
  description?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

export class PointServicePointExpiryRuleOutput extends PointServicePointExpiryRuleGqlOutput {}
