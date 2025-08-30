import { Field, ObjectType } from '@nestjs/graphql';
import { UserServiceUserGqlOutput } from '@zma-nestjs-monorepo/zma-types/outputs/user/user';

@ObjectType()
export class TokenOutput {
  @Field()
  accessToken!: string;

  @Field()
  accessTokenExpiry!: string;

  @Field()
  refreshToken!: string;

  @Field()
  refreshTokenExpiry!: string;

  @Field()
  user!: UserServiceUserGqlOutput;
}
