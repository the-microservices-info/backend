import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyparser from 'koa-bodyparser';
import * as logger from 'koa-logger';
import * as json from 'koa-json';
import * as cors from '@koa/cors';
import * as jwt from 'jsonwebtoken';

import { validate, ValidationOutput } from './validations';

const secret: string = process.env.APP_SECRET as string;

if (!secret) {
  console.error('[!] APP_SECRET undefined! It must be defined!');
  process.exit(1);
}

export const app: Koa = new Koa();
app.use(bodyparser());
app.use(logger());
app.use(json());
app.use(cors());

const router: Router = new Router();

app.use(
  async (ctx: Koa.Context, next: any): Promise<void> => {
    try {
      const { token } = ctx.request.body;
      const payload = jwt.verify(token, secret);
      ctx.request.body = payload;
    } catch (e) {
      ctx.request.body = null;
      console.dir(e);
    } finally {
      await next();
    }
  }
);

router.post(
  '/answers',
  async (ctx: Koa.Context): Promise<void> => {
    const { isValid, reasons }: ValidationOutput = validate(ctx.request.body);

    if (!isValid) {
      ctx.body = { errors: reasons };
      ctx.status = 400;
      return;
    }
    const { ops } = await ctx.db.collection('answers').insertOne(ctx.request.body);

    ctx.status = 201;
    ctx.body = { answers: ops };
  }
);

router.get('/', (ctx: Koa.Context): void => {
  ctx.redirect('https://themicroservicesinfo.netlify.app');
});

app.use(router.routes()).use(router.allowedMethods());
