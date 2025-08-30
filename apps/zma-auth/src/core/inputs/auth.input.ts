import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
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
export class ZaloLoginInput {
  @Field()
  @IsNotEmpty()
  token: string;

  @Field()
  @IsNotEmpty()
  phoneNumberToken: string;
}

@InputType()
export class ZaloRegisterInput {
  @Field()
  @IsNotEmpty()
  token: string;

  @Field()
  @IsNotEmpty()
  tenantId: string;

  @Field()
  @IsNotEmpty()
  code: string;
}

@InputType()
export class ForgotPasswordInput {
  @Field()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsNotEmpty()
  currentPassword: string;

  @Field()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsNotEmpty()
  token: string;

  @Field()
  @IsNotEmpty()
  newPassword: string;
}

export class RegisterPasswordPolicy {
  @IsNumber()
  minLength: number;

  @IsNumber()
  maxLength: number;

  @IsBoolean()
  uppercase: boolean;

  @IsBoolean()
  lowercase: boolean;

  @IsBoolean()
  numbers: boolean;

  @IsBoolean()
  specialChars: boolean;
}

export class VerificationTokenInput {
  @IsString()
  userId!: string;

  @IsString()
  verificationCode!: string;

  @IsNumber()
  expirationAt?: number;
}

@InputType()
export class ConfirmTokenInput {
  @IsString()
  @Field(() => String)
  token!: string;
}

@InputType()
export class LoginWithSocialInput {
  @Field()
  @IsString()
  token: string;
}

@InputType()
export class ImpersonateUserInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  targetUserId: string;
}
