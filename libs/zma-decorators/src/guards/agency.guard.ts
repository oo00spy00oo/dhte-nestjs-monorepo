import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedUser } from '@zma-nestjs-monorepo/zma-types';
import { UserServiceUserType } from '@zma-nestjs-monorepo/zma-types';
import { Observable } from 'rxjs';

@Injectable()
export class AgencyGuard extends AuthGuard('jwt') {
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
    const user = this.getRequest(context).user as AuthenticatedUser;
    const allowedTypes = [UserServiceUserType.Agency, UserServiceUserType.Admin];
    if (user && allowedTypes.includes(user.type as UserServiceUserType)) {
      return super.canActivate(context);
    }
    return false;
  }
}
