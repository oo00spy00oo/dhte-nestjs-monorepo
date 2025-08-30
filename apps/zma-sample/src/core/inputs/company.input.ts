import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

@InputType()
export class CompanyInput {
  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  name: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  address?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  workingHour?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  lunchBreak?: string;

  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  @Field(() => [String], { nullable: true })
  locations: string[];

  @IsOptional()
  @IsString()
  @Field()
  description?: string;

  @IsOptional()
  @IsInt()
  @Field()
  totalEmployees?: number;
}
