import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyparser from 'koa-bodyparser';
import * as logger from 'koa-logger';
import * as json from 'koa-json';
import * as cors from '@koa/cors';
import * as jwt from 'jsonwebtoken';

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

interface ValidationOutput {
  isValid: boolean;
  reasons: string[];
}

const valIntroduction: (data: any) => ValidationOutput = (data: any) => {
  const intro: any = data.introduction;
  const reasons: string[] = [];

  if (intro === undefined) {
    reasons.push("attr 'introduction' must be defined");
    return { isValid: false, reasons };
  }

  if (intro.allowed === undefined) {
    reasons.push("attr 'introduction.allowed' must be defined");
    return { isValid: false, reasons };
  }

  if (typeof intro.allowed !== 'boolean') {
    reasons.push("attr 'introduction.allowed' must be of type Boolean");
    return { isValid: false, reasons };
  }

  return { isValid: true, reasons };
};

const valBgExp: (data: any) => ValidationOutput = (data: any) => {
  const bg: any = data.backgroundExperience;
  let isValid = true;
  const reasons: string[] = [];

  if (bg === undefined) {
    reasons.push("attr 'backgroundExperience' must be defined");
    return { isValid: false, reasons };
  }

  if (bg.knowledgeLevel === undefined) {
    reasons.push("attr 'backgroundExperience.knowledgeLevel' must be defined");
    isValid = false;
  } else if (typeof bg.knowledgeLevel !== 'number') {
    reasons.push("attr 'backgroundExperience.knowledgeLevel' must be a number");
    isValid = false;
  } else if (0 > bg.knowledgeLevel || bg.knowledgeLevel > 5) {
    reasons.push("attr 'backgroundExperience.knowledgeLevel' must be gt 0 and lt 6");
    isValid = false;
  }

  if (bg.knowledgeSource === undefined) {
    reasons.push("attr 'backgroundExperience.knowledgeSource' must be defined");
    isValid = false;
  }

  if (bg.years === undefined) {
    reasons.push("attr 'backgroundExperience.years' must be defined");
    isValid = false;
  }

  return { isValid, reasons };
};

const validate: (data: any) => ValidationOutput = (data: any) => {
  const introValid: ValidationOutput = valIntroduction(data);
  const bgExpValid: ValidationOutput = valBgExp(data);

  return {
    isValid: introValid.isValid && bgExpValid.isValid,
    reasons: introValid.reasons.concat(bgExpValid.reasons)
  };
};

app.use(
  async (ctx: Koa.Context, next: any): Promise<void> => {
    try {
      const { token } = ctx.request.body;
      const payload = jwt.verify(token, secret);
      ctx.request.body = payload;
      await next();
    } catch (e) {
      ctx.request.body = null;
      console.dir(e);
      ctx.body = { error: 'Invalid payload' };
      ctx.status = 401;
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
