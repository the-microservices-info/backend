import * as request from 'supertest';
import * as Fixtures from 'node-mongodb-fixtures';
import { MongoClient } from 'mongodb';
import { app } from './app';
import { patterns } from './validations';

describe('answers', () => {
  const key = 'test';
  let connection: any;
  let db: any;
  let server: any;

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_URL as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    db = connection.db();

    app.context.db = db;
    app.context.ANSWERS_KEY = key;

    server = app.listen();
  });

  beforeEach(async () => {
    await db.collection('answers').deleteMany({});
  });

  afterAll(async () => {
    await server.close();
    await connection.close();
  });

  describe('GET /', () => {
    it('redirects', async () => {
      const { statusCode } = await request(app.callback()).get('/');

      expect(statusCode).toBe(302);
    });
  });

  describe('key protected GET routes', () => {
    const protectedGETSubroutes = ['', '/backgroundExperience'];

    protectedGETSubroutes.forEach((subroute: string): void => {
      const fullRoute = `/answers${subroute}`;

      it(`GET ${fullRoute} blocks without a "key" parameter`, async () => {
        const { statusCode } = await request(app.callback()).get(fullRoute);

        expect(statusCode).toBe(401);
      });

      it(`GET ${fullRoute} blocks without the right "key" parameter`, async () => {
        const { statusCode } = await request(app.callback()).get(fullRoute).query({ key: 'foo' });

        expect(statusCode).toBe(401);
      });

      it(`GET ${fullRoute} allows`, async () => {
        const { statusCode } = await request(app.callback()).get(fullRoute).query({ key });

        expect(statusCode).toBe(200);
      });
    });
  });

  describe('GET /answers', () => {
    it('returns a list of answers and a hash of patterns grouped', async () => {
      const {
        body: { answers }
      } = await request(app.callback()).get('/answers').query({ key });

      expect(answers).toBeInstanceOf(Array);
    });
  });

  describe('POST /answers', () => {
    it("fails when the structure isn't correct", async () => {
      const data = {};

      const {
        statusCode,
        body: { errors }
      } = await request(app.callback()).post('/answers').send(data);

      expect(statusCode).toBe(400);
      expect(errors).toBeDefined();
    });

    it('return 201 when the structure is correct', async () => {
      const goodAnswer = {
        introduction: { allowed: true },
        backgroundExperience: {
          knowledgeLevel: 3,
          knowledgeSource: 'Books, blog posts or written tutorials',
          years: '1 - 2 years'
        },
        personalInformation: { name: '', email: '', available: undefined },
        ...patterns.reduce((pAns: any, pattern: string): any => {
          pAns[pattern] = {
            isUsed: false,
            knowledgeType: "I didn't know"
          };

          return pAns;
        }, {})
      };
      const {
        statusCode,
        body: { answers }
      } = await request(app.callback()).post('/answers').send(goodAnswer);

      expect(statusCode).toBe(201);
      expect(answers._id).toBeDefined();
    });
  });

  describe('GET /answers/backgroundExperience', () => {
    beforeEach(async () => {
      const fixtures = new Fixtures({ mute: true });
      await fixtures.connect(process.env.MONGO_URL as string);
      await fixtures.unload();
      await fixtures.load();
      await fixtures.disconnect();
    });

    it('returns an aggregation of the backgroundExperience section', async () => {
      const {
        body: { backgroundExperience }
      } = await request(app.callback()).get('/answers/backgroundExperience').query({ key });

      expect(backgroundExperience).toEqual({
        knowledgeSource: {
          'Books, blog posts or written tutorials': 1,
          'Professional course, workshop or conference tutorial': 0,
          'A collegue or consultant': 1,
          'Learned on the job by myself': 0
        },
        knowledgeLevel: {
          1: 0,
          2: 0,
          3: 0,
          4: 1,
          5: 1
        },
        years: {
          '0 - 1 year': 0,
          '1 - 2 years': 1,
          '2 - 4 years': 1,
          '4+ years': 0
        }
      });
    });
  });
});
