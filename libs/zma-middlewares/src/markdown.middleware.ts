import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';
import { MarkdownUtil } from '@zma-nestjs-monorepo/zma-utils';

export const markdownMiddleware: FieldMiddleware = async (ctx: MiddlewareContext, next: NextFn) => {
  const value = await next();
  if (!value) {
    return value;
  }
  return MarkdownUtil.parse(value);
};
