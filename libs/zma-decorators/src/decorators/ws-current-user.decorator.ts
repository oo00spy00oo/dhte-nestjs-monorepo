import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthenticatedUser } from '@zma-nestjs-monorepo/zma-types';
import { Socket } from 'socket.io';

// Extend Socket type to include user property
interface SocketWithUser extends Socket {
  user?: AuthenticatedUser;
}

export const WsCurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const client: SocketWithUser = context.switchToWs().getClient<Socket>();

    // Get the user attached by WsAuthGuard
    const user = client.user;

    if (!user) {
      throw new WsException(
        'User not found in WebSocket context. Make sure WsAuthGuard is applied.',
      );
    }

    // Get accept-language from headers for i18n support
    const acceptLanguage =
      client.handshake.headers['accept-language']?.toString().split(',')[0]?.split('-')[0] || 'en';

    // Create a proper AuthenticatedUser instance with language
    const authenticatedUser = Object.assign(new AuthenticatedUser(), user, {
      acceptLanguage,
    });

    return authenticatedUser;
  },
);
