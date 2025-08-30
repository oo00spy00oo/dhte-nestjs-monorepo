import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';

export const contentMiddleware: FieldMiddleware = async (ctx: MiddlewareContext, next: NextFn) => {
  const value = await next();
  if (!value) {
    return value;
  }
  return value
    .replace(/\\#([A-Za-z0-9]+)/g, (match: string, p1: string) => {
      console.log('contentMiddleware:', match, p1);
      return formatter(match);
    })
    .replace(/\$([A-Za-z0-9]+)/g, (match: string, p1: string) => {
      console.log('contentMiddleware:', match, p1);
      return formatter(match);
    });
};

const formatter = (value: string) => {
  return `<a style="color:#5B9BE3;">${value}</a>`;
};
