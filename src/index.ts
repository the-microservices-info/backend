// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { MongoClient } from 'mongodb';

const mongoURL = process.env.MONGO_URL;
console.log(mongoURL);

const mongoClient = new MongoClient(mongoURL);

async function bootstrap() {
  try {
    await mongoClient.connect();

    await mongoClient.db('admin').command({ ping: 1 });
    console.log('Connected successfully to Mongo server');
  } finally {
    await mongoClient.close();
  }
}

bootstrap().catch(console.dir);
