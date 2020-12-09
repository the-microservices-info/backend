import * as Koa from 'koa';

export const frontURL = process.env.FRONT_URL || 'http://localhost:3000';

const allowlist = ['', '/results'].map((base: string): string => frontURL + base);

export function acceptedOrigins(ctx: Koa.Context): string {
  const requestOrigin = ctx.get('Origin');

  if (!allowlist.includes(requestOrigin))
    return ctx.throw(`${requestOrigin} is not a valid origin`);

  return requestOrigin;
}
