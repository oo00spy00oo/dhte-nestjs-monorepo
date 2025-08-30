import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedUser } from '@zma-nestjs-monorepo/zma-types';

import { IS_PUBLIC_KEY, SKIP_TENANT_KEY } from '../decorators';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  override getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const isAuthenticated = (await super.canActivate(context)) as boolean;
    if (!isAuthenticated) {
      // If the token is invalid or not present, authentication fails.
      return false;
    }
    const skipTenant = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipTenant) {
      return true;
    }
    const request = this.getRequest(context);
    // check x-tenant-id in request header must be in user.tenantIds
    const tenantId = request.headers['x-tenant-id'] as string;
    const user = request.user as AuthenticatedUser;
    // TODO: check tenantId is not available for user type is User
    if (!user?.tenantIds || user?.tenantIds?.length === 0) {
      return false;
    }
    if (user.tenantIds.includes(tenantId)) {
      return true;
    }
    return false;
  }
}
