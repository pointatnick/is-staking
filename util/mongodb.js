import { MongoClient } from 'mongodb';

let uri = process.env.MONGODB_URI;
let serpentDbName = process.env.SERPENTS_DB;
let diamondDbName = process.env.DIAMONDS_DB;

let cachedClient = null;
let cachedSerpentDb = null;
let cachedDiamondDb = null;

if (!uri) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

if (!serpentDbName) {
  throw new Error(
    'Please define the SERPENT_DB environment variable inside .env.local'
  );
}

if (!diamondDbName) {
  throw new Error(
    'Please define the DIAMOND_DB environment variable inside .env.local'
  );
}

export async function connectToDatabase() {
  if (cachedClient && cachedSerpentDb && cachedDiamondDb) {
    return {
      client: cachedClient,
      serpentDb: cachedSerpentDb,
      diamondDb: cachedDiamondDb,
    };
  }

  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const serpentDb = await client.db(serpentDbName);
  const diamondDb = await client.db(diamondDbName);

  cachedClient = client;
  cachedSerpentDb = serpentDb;
  cachedDiamondDb = diamondDb;

  return { client, serpentDb, diamondDb };
}
