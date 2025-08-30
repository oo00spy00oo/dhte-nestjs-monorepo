import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
  CurrentTenant,
  CurrentUser,
  Public,
  SkipTenant,
} from '@zma-nestjs-monorepo/zma-decorators';
import { AuthenticatedUser } from '@zma-nestjs-monorepo/zma-types';

import {
  ChangePasswordInput,
  ConfirmTokenInput,
  ForgotPasswordInput,
  ImpersonateUserInput,
  LoginInput,
  LoginWithSocialInput,
  RegisterInput,
  ResetPasswordInput,
  ZaloLoginInput,
} from '../../core/inputs';
import { TokenOutput } from '../../core/outputs';
import { AuthUseCase } from '../../use-cases/auth/auth.use-case';

@Resolver()
export class AuthMutation {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @Public()
  @Mutation(() => TokenOutput)
  async authServiceEmailLogin(
    @Args('input') input: LoginInput,
    @CurrentTenant() tenantId: string,
  ): Promise<TokenOutput> {
    return this.authUseCase.loginWithEmail({ input, tenantId });
  }

  @Public()
  @Mutation(() => TokenOutput)
  async authServiceZaloLogin(
    @Args('input') input: ZaloLoginInput,
    @CurrentTenant() tenantId: string,
  ): Promise<TokenOutput> {
    return this.authUseCase.zaloLogin(tenantId, input);
  }

  @Public()
  @Mutation(() => Boolean)
  async authServiceEmailRegister(
    @CurrentTenant() tenantId: string,
    @Args('input') input: RegisterInput,
  ): Promise<boolean> {
    return this.authUseCase.registerWithEmail({ tenantId, input });
  }

  @Public()
  @Mutation(() => Boolean)
  async authServiceEmailForgotPassword(
    @Args('input') input: ForgotPasswordInput,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    return this.authUseCase.forgotPassword({ input, tenantId });
  }

  @Mutation(() => Boolean)
  async authServiceChangePassword(
    @Args('input') input: ChangePasswordInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    return this.authUseCase.changePassword({ userId: user.id, input, tenantId });
  }

  @Public()
  @Mutation(() => Boolean)
  async authServiceResetPassword(
    @Args('input') input: ResetPasswordInput,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    return this.authUseCase.resetPassword({ input, tenantId });
  }

  @Public()
  @Mutation(() => TokenOutput)
  async authServiceRefreshToken(
    @Args('refreshToken') refreshToken: string,
    @CurrentTenant() tenantId: string,
  ): Promise<TokenOutput> {
    return this.authUseCase.refreshToken({ refreshToken, tenantId });
  }

  @Public()
  @Mutation(() => Boolean)
  async authServiceConfirmRegister(
    @Args('input') input: ConfirmTokenInput,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    return this.authUseCase.confirmRegister({ token: input.token, tenantId });
  }

  @Public()
  @Mutation(() => TokenOutput)
  async authServiceLoginWithGoogle(
    @CurrentTenant() tenantId: string,
    @Args('input') input: LoginWithSocialInput,
  ): Promise<TokenOutput> {
    return this.authUseCase.loginWithGoogle({
      tenantId,
      token: input.token,
    });
  }

  @Mutation(() => TokenOutput)
  @SkipTenant()
  async authServiceImpersonateUser(
    @Args('input') input: ImpersonateUserInput,
    @CurrentUser() currentUser: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<TokenOutput> {
    return this.authUseCase.impersonateUser({ currentUser, input, tenantId: tenantId ?? '' });
  }
}
