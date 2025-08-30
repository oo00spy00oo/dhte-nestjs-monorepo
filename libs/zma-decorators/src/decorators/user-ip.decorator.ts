import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const UserIp = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context);
  const request = ctx.getContext().req;

  // Check for Cloudflare
  if (request.headers['cf-connecting-ip']) {
    return request.headers['cf-connecting-ip'];
  }

  // Check for forwarded IPs (most proxies/load balancers)
  if (request.headers['x-forwarded-for']) {
    const ips = request.headers['x-forwarded-for'].split(',');
    return ips[0].trim();
  }

  // Check other common headers
  if (request.headers['x-real-ip']) {
    return request.headers['x-real-ip'];
  }

  if (request.headers['x-client-ip']) {
    return request.headers['x-client-ip'];
  }

  // Direct connection
  if (request.connection && request.connection.remoteAddress) {
    // Remove IPv6 prefix if present
    return request.connection.remoteAddress.replace(/^::ffff:/, '');
  }
  return '0.0.0.0';
});
