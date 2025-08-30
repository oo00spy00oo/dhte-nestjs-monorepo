import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedUser } from '@zma-nestjs-monorepo/zma-types';
import { Socket } from 'socket.io';

import { IS_PUBLIC_KEY, SKIP_TENANT_KEY } from '../decorators';

interface SocketWithUser extends Socket {
  user?: AuthenticatedUser;
  __wsRequest?: {
    headers: {
      authorization?: string;
      'x-tenant-id'?: string;
    };
    user?: AuthenticatedUser;
  };
}

@Injectable()
export class WsAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  override getRequest(context: ExecutionContext) {
    const client = context.switchToWs().getClient<SocketWithUser>();
    const authHeader = (client.handshake.headers['authorization'] ||
      client.handshake.auth['Authorization']) as string;
    const tenantHeader = (client.handshake.headers['x-tenant-id'] ||
      client.handshake.auth['x-tenant-id']) as string;

    if (!client.__wsRequest) {
      client.__wsRequest = {
        headers: {
          authorization: authHeader,
          'x-tenant-id': tenantHeader,
        },
        user: undefined,
      };
    }

    return client.__wsRequest;
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<SocketWithUser>();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const authResult = await super.canActivate(context);
    if (!authResult && !isPublic) {
      return false;
    }

    const request = client.__wsRequest;
    const user = request?.user;

    if (user) {
      client.user = user;
    }

    if (isPublic) {
      return true;
    }

    if (!user) {
      return false;
    }

    const skipTenant = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipTenant) {
      return true;
    }

    const tenantId = request?.headers['x-tenant-id'];
    if (!tenantId) {
      return false;
    }

    if (!user.tenantIds?.includes(tenantId)) {
      return false;
    }

    return true;
  }
}
