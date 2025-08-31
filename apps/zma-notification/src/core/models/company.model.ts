import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Company' })
export class Company {
  @Field(() => String, { name: 'id' })
  _id?: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  workingHour?: string;

  @Field({ nullable: true })
  lunchBreak?: string;

  @Field({ nullable: true })
  websiteUrl?: string;

  @Field(() => [String], { nullable: true })
  locations: string[];

  @Field({ nullable: true })
  description?: string;

  @Field()
  totalEmployees?: number;
}
