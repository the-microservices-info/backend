import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyparser from 'koa-bodyparser';
import * as json from 'koa-json';
import * as cors from '@koa/cors';

import { validate } from './validations';

const frontURL = process.env.FRONT_URL || 'http://localhost:3030';

const corsConfig: any = { origin: frontURL };

export const app: Koa = new Koa();
app.use(bodyparser());
app.use(json());
app.use(cors(corsConfig));

const router: Router = new Router();

router.post(
  '/answers',
  async (ctx: Koa.Context): Promise<void> => {
    const { isValid, reasons }: any = validate(ctx.request.body);

    if (!isValid) {
      ctx.body = { errors: reasons };
      ctx.status = 400;
      return;
    }
    const { ops } = await ctx.db.collection('answers').insertOne(ctx.request.body);

    ctx.status = 201;
    ctx.body = { answers: ops[0] };
  }
);

router.get('/', (ctx: Koa.Context): void => {
  ctx.redirect(frontURL);
});

router.get(
  '/answers',
  async (ctx: Koa.Context): Promise<void> => {
    const { key }: any = ctx.query;

    if (key !== ctx.ANSWERS_KEY) {
      ctx.status = 401;
      return;
    }

    const answers = await ctx.db.collection('answers').find({}).toArray();

    ctx.body = { answers };
  }
);

app.use(router.routes()).use(router.allowedMethods());
