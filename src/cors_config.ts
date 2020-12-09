import * as Koa from 'koa';

export const frontURL = process.env.FRONT_URL || 'http://localhost:3000';

export function acceptedOrigins(ctx: Koa.Context): string {
  const requestOrigin = ctx.headers.origin;

  const allowlistRegex = new RegExp(`^${frontURL}(/results.key=\\w+)?$`);

  if (!allowlistRegex.test(requestOrigin))
    return ctx.throw(`${requestOrigin} is not a valid origin`);

  return requestOrigin;
}
