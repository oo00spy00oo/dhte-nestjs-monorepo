import { Query, Resolver } from '@nestjs/graphql';
import { CurrentUser, SkipTenant } from '@zma-nestjs-monorepo/zma-decorators';
import { AuthenticatedUser } from '@zma-nestjs-monorepo/zma-types';
import { UserServiceUserGqlOutput } from '@zma-nestjs-monorepo/zma-types/outputs/user/user';

import { AuthUseCase } from '../../use-cases/auth/auth.use-case';

@Resolver()
export class AuthResolver {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @Query(() => UserServiceUserGqlOutput)
  @SkipTenant()
  async authServiceMe(@CurrentUser() user: AuthenticatedUser): Promise<UserServiceUserGqlOutput> {
    return this.authUseCase.getUser(user.id);
  }
}
