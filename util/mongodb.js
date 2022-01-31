import { MongoClient } from 'mongodb';

let uri = process.env.MONGODB_URI;
let dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

if (!dbName) {
  throw new Error(
    'Please define the MONGODB_DB environment variable inside .env.local'
  );
}

export async function connectToDatabase() {
  // TODO: not caching might backfire
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = await client.db(dbName);
  return { client, db };
}
