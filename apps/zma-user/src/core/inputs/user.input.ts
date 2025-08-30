import { Field, GraphQLISODateTime, InputType } from '@nestjs/graphql';
import { UserServiceGender } from '@zma-nestjs-monorepo/zma-types';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

@InputType()
export class UserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @Field()
  @IsNotEmpty()
  firstName: string;

  @Field()
  @IsNotEmpty()
  lastName: string;
}

@InputType()
export class UpdateProfileInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  birthDate?: Date;

  @Field(() => UserServiceGender, { nullable: true })
  @IsOptional()
  @IsEnum(UserServiceGender)
  gender?: UserServiceGender;
}

@InputType()
export class UpdateAvatarInput {
  @Field(() => String)
  @IsString()
  avatarUrl: string;
}

@InputType()
export class UpdateZaloOAIdInput {
  @Field(() => String)
  @IsString()
  zaloOAId: string;
}
