import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

import { FindManyOutput } from '../../../common/outputs';
import { UserServiceGender, UserServiceUserStatus, UserServiceUserType } from '../../../enums';

registerEnumType(UserServiceUserType, { name: 'UserServiceUserType' });
registerEnumType(UserServiceUserStatus, { name: 'UserServiceUserStatus' });
registerEnumType(UserServiceGender, { name: 'UserServiceGender' });

@ObjectType()
export class UserServiceSocialProvider {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  email!: string;
}

@ObjectType()
export class UserServiceSocialProviders {
  @Field(() => UserServiceSocialProvider, { nullable: true })
  google?: UserServiceSocialProvider;

  @Field(() => UserServiceSocialProvider, { nullable: true })
  facebook?: UserServiceSocialProvider;
}

@ObjectType({ description: 'User' })
export class UserServiceUserGqlOutput {
  @Field(() => String, { name: 'id' })
  _id?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;

  @Field(() => String, { nullable: true })
  fullName?: string;

  @Field(() => String, { nullable: true })
  zaloId?: string;

  @Field(() => String, { nullable: true })
  zaloOAId?: string;

  @Field(() => String, { nullable: true })
  phoneNumber?: string;

  @Field(() => String, { nullable: true })
  birthDate?: string;

  @Field(() => UserServiceGender, { nullable: true })
  gender?: UserServiceGender;

  @Field(() => String, { nullable: true })
  avatarUrl?: string;

  @Field(() => UserServiceUserType)
  type!: UserServiceUserType;

  @Field(() => UserServiceUserStatus)
  status!: UserServiceUserStatus;

  @Field(() => String, { nullable: true })
  lastActive?: string;

  @Field(() => String, { nullable: true })
  tenantId?: string;

  @Field(() => String, { nullable: true })
  organizationId?: string;

  @Field(() => String, { nullable: true })
  createdAt?: string;

  @Field(() => String, { nullable: true })
  updatedAt?: string;
}

@ObjectType({ description: 'User' })
export class UserServiceUser extends UserServiceUserGqlOutput {
  @Field(() => UserServiceSocialProviders, { nullable: true })
  socialProviders?: UserServiceSocialProviders;

  @Field(() => String, { nullable: true })
  password?: string;

  @Field(() => String, { nullable: true })
  resetToken?: string;

  @Field(() => String, { nullable: true })
  resetTokenExpiry?: string;

  @Field(() => Number, { nullable: true, defaultValue: 0 })
  failedLoginAttempts?: number;

  @Field(() => String, { nullable: true })
  verificationCode?: string;
}

export class UserServiceUpdateSocialProviders {
  @IsNotEmpty()
  socialProviders!: UserServiceSocialProviders;
}

@ObjectType()
export class UserServiceUsersGlqOutput extends FindManyOutput(UserServiceUserGqlOutput) {}
