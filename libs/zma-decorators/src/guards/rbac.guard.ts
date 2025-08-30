import {
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import {
  AuthPossession,
  RBAC_PERMISSIONS_KEY,
  UserServiceUserType,
} from '@zma-nestjs-monorepo/zma-types';
import { PermissionOutput } from '@zma-nestjs-monorepo/zma-types/outputs/rbac';

import { IS_PUBLIC_KEY, SKIP_TENANT_KEY } from '../decorators';
import { RbacService } from '../services';

@Injectable()
export class RbacGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(RbacGuard.name);
  constructor(
    protected readonly reflector: Reflector,
    @Inject(RbacService) private readonly rbacService: RbacService,
  ) {
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
    const permissions = this.reflector.getAllAndOverride(RBAC_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!permissions) {
      return true;
    }

    const request = this.getRequest(context);
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    if (
      permissions.possession === AuthPossession.Admin &&
      user.type !== UserServiceUserType.Admin
    ) {
      return false;
    } else if (
      permissions.possession === AuthPossession.Admin &&
      user.type === UserServiceUserType.Admin
    ) {
      return true;
    }

    const skipTenant = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!skipTenant) {
      // check x-tenant-id in request header must be in user.tenantIds
      const tenantId = request.headers['x-tenant-id'] as string;
      if (permissions.possession === AuthPossession.Tenant && !tenantId) {
        return false;
      }
      if (permissions.possession === AuthPossession.Tenant && !user.tenantIds.includes(tenantId)) {
        return false;
      }
    }

    const roles = await this.rbacService.getUserRoles(user.id);
    const rolePermissions = roles?.flatMap((role) => role.permissions) || [];

    const hasPermission = rolePermissions.some((permission: PermissionOutput) => {
      let isPass =
        permission.action === permissions.action && permission.resource === permissions.resource;
      // check possession
      if (permissions.possession !== AuthPossession.Any) {
        isPass = isPass && permission.possession === permissions.possession;
      }
      return isPass;
    });

    return hasPermission;
  }
}
