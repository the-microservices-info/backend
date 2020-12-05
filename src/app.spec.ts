import * as request from 'supertest';
import { MongoClient } from 'mongodb';
import { app } from './app';

describe('answers', () => {
  let connection: any;
  let db: any;
  let server: any;

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    db = connection.db();

    app.context.db = db;
    app.context.ANSWERS_KEY = 'test';

    server = app.listen();
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

  describe('GET /answers', () => {
    it('blocks without a "key" parameter', async () => {
      const { statusCode } = await request(app.callback()).get('/answers');

      expect(statusCode).toBe(401);
    });

    it('blocks without the right "key" parameter', async () => {
      const { statusCode } = await request(app.callback()).get('/answers').query({ key: 'foo' });

      expect(statusCode).toBe(401);
    });

    describe('when the right key is passed', () => {
      const key = 'test';

      it('allows', async () => {
        const { statusCode } = await request(app.callback()).get('/answers').query({ key });

        expect(statusCode).toBe(200);
      });

      it('returns a list of answers and a hash of patterns grouped', async () => {
        const {
          body: { answers }
        } = await request(app.callback()).get('/answers').query({ key });

        expect(answers).toBeInstanceOf(Array);
      });
    });
  });

  describe('POST /answers', () => {
    it("fails when the structure isn't correct", async () => {
      const badAnswer = { introduction: {} };
      const {
        statusCode,
        body: { errors }
      } = await request(app.callback()).post('/answers').send(badAnswer);

      expect(statusCode).toBe(400);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
