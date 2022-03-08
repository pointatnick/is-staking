import { Db, MongoClient } from 'mongodb';

let uri = process.env.MONGODB_URI!;
let serpentDbName = process.env.SERPENTS_DB;
let diamondDbName = process.env.DIAMONDS_DB;

let cachedClient: MongoClient | undefined;
let cachedSerpentDb: Db | undefined;
let cachedDiamondDb: Db | undefined;

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
  console.log('requested');
  if (cachedClient && cachedSerpentDb && cachedDiamondDb) {
    return {
      client: cachedClient,
      serpentDb: cachedSerpentDb,
      diamondDb: cachedDiamondDb,
    };
  }

  const client = new MongoClient(uri, {
    //@ts-ignore
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxIdleTimeMS: 10000,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 20000,
  });

  await client.connect();

  cachedClient = client;
  cachedSerpentDb = client.db(serpentDbName);
  cachedDiamondDb = client.db(diamondDbName);

  return {
    client: cachedClient,
    serpentDb: cachedSerpentDb,
    diamondDb: cachedDiamondDb,
  };
}