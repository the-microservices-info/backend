import * as request from 'supertest';
import * as Fixtures from 'node-mongodb-fixtures';
import { MongoClient } from 'mongodb';
import { app, routedPatterns } from './app';
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
    const protectedGETSubroutes = [
      '',
      '/backgroundExperience',
      ...routedPatterns.map(({ route }: any): string => '/' + route)
    ];

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

  describe('getting data sections', () => {
    beforeEach(async () => {
      const fixtures = new Fixtures({ mute: true });
      await fixtures.connect(process.env.MONGO_URL as string);
      await fixtures.unload();
      await fixtures.load();
      await fixtures.disconnect();
    });

    test('GET /answers/backgroundExperience returns an aggregation of the backgroundExperience section', async () => {
      const {
        body: { backgroundExperience }
      } = await request(app.callback()).get('/answers/backgroundExperience').query({ key });

      expect(backgroundExperience).toEqual({
        knowledgeSource: {
          'Books, blog posts or written tutorials': 0,
          'Professional course, workshop or conference tutorial': 0,
          'A collegue or consultant': 1,
          'Learned on the job by myself': 0
        },
        knowledgeLevel: {
          1: 0,
          2: 0,
          3: 0,
          4: 1,
          5: 0
        },
        years: {
          '0 - 1 year': 0,
          '1 - 2 years': 0,
          '2 - 4 years': 1,
          '4+ years': 0
        },
        comments: []
      });
    });

    routedPatterns.forEach(({ route, name }: any): void => {
      test(`GET /answers/${route} returns an aggregation of the backgroundExperience section`, async () => {
        const { body } = await request(app.callback()).get(`/answers/${route}`).query({ key });

        expect(body[name]).toEqual({
          isUsed: 0,
          knowledgeType: {
            'Yes, I knew as a pattern': 1,
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
        });
      });
    });
  });
});
