import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticatedUser } from '@zma-nestjs-monorepo/zma-types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const userData = request.user;
    const acceptLanguage = request.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';

    // Create a proper AuthenticatedUser instance
    const user = Object.assign(new AuthenticatedUser(), userData, {
      acceptLanguage,
    });

    return user;
  },
);
