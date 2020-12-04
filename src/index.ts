// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { MongoClient } from 'mongodb';

import { app } from './app';

const mongoURL = process.env.MONGO_URL || 'mongo://localhost:27017';
const port = process.env.PORT || 3030;

const mongoClient = new MongoClient(mongoURL);

async function bootstrap() {
  await mongoClient.connect();

  app.context.db = mongoClient.db('themsinfo');
  app.context.ANSWERS_KEY = process.env.ANSWERS_KEY;

  app.listen(port, () => console.log('=== Server Running!\n\n\n'));
}

bootstrap().catch(console.dir);
