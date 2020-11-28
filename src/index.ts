// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { MongoClient } from 'mongodb';

import { app } from './app';

const mongoURL = process.env.MONGO_URL || 'mongo://localhost:27017';
const port = process.env.PORT || 3000;

const mongoClient = new MongoClient(mongoURL);

async function bootstrap() {
  try {
    await mongoClient.connect();

    app.context.db = mongoClient.db('themsinfo');

    app.listen(port, () => console.log('=== Server Running!\n\n\n'));
  } finally {
    await mongoClient.close();
  }
}

bootstrap().catch(console.dir);
