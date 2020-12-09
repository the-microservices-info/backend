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
    const initialAccumulator = {
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
      },
      comments: []
    };

    const answers = await ctx.db.collection('answers').find({}).toArray();

    const backgroundExperience = answers
      .map((answer: any): any => answer.backgroundExperience)
      .reduce((acc: any, bgExp: any): any => {
        acc.knowledgeSource[bgExp.knowledgeSource] += 1;
        acc.knowledgeLevel[bgExp.knowledgeLevel] += 1;
        acc.years[bgExp.years] += 1;
        if (bgExp.comments !== '') acc.comments.push(bgExp.comments);
        return acc;
      }, initialAccumulator);

    ctx.body = { backgroundExperience };
  }
);

export const routedPatterns = [
  { route: 'databasePerService', name: 'Database per Service' },
  { route: 'saga', name: 'Saga' },
  { route: 'eventSourcing', name: 'Event Sourcing' },
  { route: 'domainEvent', name: 'Domain Event' },
  { route: 'cqrs', name: 'CQRS' },
  { route: 'apiComposition', name: 'API Composition' },
  { route: 'serviceRegistry', name: 'Service Registry' },
  { route: 'selfContainedService', name: 'Self-Contained Service' },
  { route: 'asynchronousMessaging', name: 'Asynchronous Messaging' },
  { route: 'transactionalOutbox', name: 'Transactional Outbox' },
  { route: 'adapterMicroservice', name: 'Adapter Microservice' },
  { route: 'ambassador', name: 'Ambassador' }
];

routedPatterns.forEach(({ route, name }: any): void => {
  router.get(
    `/answers/${route}`,
    verifyKey,
    async (ctx: Koa.Context): Promise<void> => {
      const initialAccumulator = {
        isUsed: 0,
        knowledgeType: {
          'Yes, I knew as a pattern': 0,
          "I recognize it as a practice, but I didn't know it was a pattern": 0,
          "I didn't know": 0
        },
        statements: [
          {
            statement: 'The pattern was present in the initial versions of the implementation',
            value: {
              'Strongly disagree': 0,
              Disagree: 0,
              Neutral: 0,
              Agree: 0,
              'Strongly agree': 0
            }
          },
          {
            statement: 'The pattern was implemented via refactoring',
            value: {
              'Strongly disagree': 0,
              Disagree: 0,
              Neutral: 0,
              Agree: 0,
              'Strongly agree': 0
            }
          },
          {
            statement: 'The pattern is implemented in various parts of the system',
            value: {
              'Strongly disagree': 0,
              Disagree: 0,
              Neutral: 0,
              Agree: 0,
              'Strongly agree': 0
            }
          },
          {
            statement: 'The usage of the pattern was beneficial to the system',
            value: {
              'Strongly disagree': 0,
              Disagree: 0,
              Neutral: 0,
              Agree: 0,
              'Strongly agree': 0
            }
          }
        ],
        comments: []
      };

      const answers = await ctx.db.collection('answers').find({}).toArray();

      ctx.body = {};
      ctx.body[name] = answers
        .map((answer: any): any => answer[name])
        .reduce((acc: any, { isUsed, knowledgeType, statements, comments }: any): any => {
          acc.isUsed += isUsed;
          acc.knowledgeType[knowledgeType] += 1;
          statements?.forEach(
            ({ value }: any, i: number): void => (acc.statements[i].value[value] += 1)
          );
          if (comments !== '') acc.comments.push(comments);
          return acc;
        }, initialAccumulator);
    }
  );
});

app.use(router.routes()).use(router.allowedMethods());
