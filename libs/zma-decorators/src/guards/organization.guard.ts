import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedUser, UserServiceUserType } from '@zma-nestjs-monorepo/zma-types';
import { Observable } from 'rxjs';

@Injectable()
export class OrganizationGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  override getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user as AuthenticatedUser;
    if (user && user.type === UserServiceUserType.OrganizationAdmin && user?.organizationId) {
      return super.canActivate(context);
    }
    return false;
  }
}
