import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyparser from 'koa-bodyparser';
import * as json from 'koa-json';
import * as cors from '@koa/cors';

import { validate } from './validations';

const frontURL = process.env.FRONT_URL || 'http://localhost:3000';

const corsConfig: any = { origin: frontURL };

export const app: Koa = new Koa();
app.use(bodyparser());
app.use(json());
app.use(cors(corsConfig));

const router: Router = new Router();

const verifyKey = async (ctx: Koa.Context, next: any): Promise<void> => {
  if (ctx.query.key == ctx.ANSWERS_KEY) await next();
  else ctx.status = 401;
};

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
  verifyKey,
  async (ctx: Koa.Context): Promise<void> => {
    const answers = await ctx.db.collection('answers').find({}).toArray();

    ctx.body = { answers };
  }
);

router.get(
  '/answers/backgroundExperience',
  verifyKey,
  async (ctx: Koa.Context): Promise<void> => {
    const answers = await ctx.db.collection('answers').find({}).toArray();

    const backgroundExperience = answers
      .map(({ backgroundExperience }: any): any => backgroundExperience)
      .reduce(
        (acc: any, bg: any): any => {
          Object.keys(bg).forEach((attr: string): void => (acc[attr][bg[attr]] += 1));

          return acc;
        },
        {
          knowledgeSource: {
            'Books, blog posts or written tutorials': 0,
            'Professional course, workshop or conference tutorial': 0,
            'A collegue or consultant': 0,
            'Learned on the job by myself': 0
          },
          knowledgeLevel: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
          },
          years: {
            '0 - 1 year': 0,
            '1 - 2 years': 0,
            '2 - 4 years': 0,
            '4+ years': 0
          }
        }
      );

    ctx.body = { backgroundExperience };
    ctx.status = 200;
  }
);

app.use(router.routes()).use(router.allowedMethods());
