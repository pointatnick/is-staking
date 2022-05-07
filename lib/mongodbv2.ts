import { ClientSession, MongoClient, ReadPreference } from 'mongodb';
import { Diamond, PairedSerpent, Serpent } from '../pages/api/types';
import {
  DIAMONDS_COLLECTION,
  DIAMONDS_DB,
  PAIRS_COLLECTION,
  SERPENTS_COLLECTION,
  SERPENTS_DB,
} from '../src/config';

const uri = process.env.MONGODB_URI!;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxIdleTimeMS: 10000,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 20000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  // @ts-ignore
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    // @ts-ignore
    global._mongoClientPromise = client.connect();
  }
  // @ts-ignore
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

async function commitWithRetry(session: ClientSession) {
  try {
    await session.commitTransaction();
    console.log('Transaction committed.');
  } catch (error: any) {
    if (error.hasErrorLabel('UnknownTransactionCommitResult')) {
      console.log(
        'UnknownTransactionCommitResult, retrying commit operation ...'
      );
      await commitWithRetry(session);
    } else {
      console.log('Error during commit ...');
      throw error;
    }
  }
}

export async function runTransactionWithRetry(
  txnFunc: (
    client: MongoClient,
    session: ClientSession,
    ...additionalData: any[]
  ) => Promise<any>,
  client: MongoClient,
  session: ClientSession,
  additionalData: any[]
) {
  try {
    await txnFunc(client, session, ...additionalData);
  } catch (error: any) {
    console.log('Transaction aborted. Caught exception during transaction.');
    console.log('Transaction info:', txnFunc.name, additionalData);

    // If transient error, retry the whole transaction
    if (error.hasErrorLabel('TransientTransactionError')) {
      console.log('TransientTransactionError, retrying transaction ...');
      await runTransactionWithRetry(txnFunc, client, session, additionalData);
    } else {
      throw error;
    }
  }
}

export async function unpairSerpent(
  client: MongoClient,
  session: ClientSession,
  pairedSerpent: PairedSerpent
) {
  session.startTransaction({
    readConcern: { level: 'snapshot' },
    writeConcern: { w: 'majority' },
    readPreference: ReadPreference.primary,
  });

  // update diamond
  await client
    .db(DIAMONDS_DB)
    .collection(DIAMONDS_COLLECTION)
    .findOneAndUpdate(
      { mint: pairedSerpent.diamondMint },
      { $set: { isPaired: false } },
      { session }
    );

  // update serpent
  const serpentsDb = client.db(SERPENTS_DB);
  await serpentsDb.collection(SERPENTS_COLLECTION).findOneAndUpdate(
    { mint: pairedSerpent.mint },
    {
      $set: {
        isPaired: false,
        lastPaired: undefined,
        lastStaked: new Date(),
      },
    },
    { session }
  );

  // finally, delete paired serpent
  await serpentsDb
    .collection(PAIRS_COLLECTION)
    .findOneAndDelete({ mint: pairedSerpent.mint }, { session });

  try {
    await commitWithRetry(session);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
}

export async function pairSerpent(
  client: MongoClient,
  session: ClientSession,
  serpent: Serpent,
  diamond: Diamond
) {
  session.startTransaction({
    readConcern: { level: 'snapshot' },
    writeConcern: { w: 'majority' },
    readPreference: ReadPreference.primary,
  });

  const { isStaked, lastStaked, icePerDay, ...pairedSerpent } = serpent;

  // update diamond
  await client
    .db(DIAMONDS_DB)
    .collection(DIAMONDS_COLLECTION)
    .findOneAndUpdate(
      { mint: diamond.mint },
      { $set: { isPaired: true } },
      { session }
    );

  // update serpent
  const serpentsDb = client.db(SERPENTS_DB);
  const lastPaired = new Date();
  await serpentsDb.collection(SERPENTS_COLLECTION).findOneAndUpdate(
    { mint: pairedSerpent.mint },
    {
      $set: {
        isPaired: true,
        lastPaired,
      },
    },
    { session }
  );

  // finally, upsert paired serpent
  await serpentsDb.collection(PAIRS_COLLECTION).updateOne(
    { mint: pairedSerpent.mint },
    {
      $set: {
        ...pairedSerpent,
        isPaired: true,
        lastPaired,
        diamondMint: diamond.mint,
        diamondRank: diamond.rank,
        diamondImageUrl: diamond.imageUrl,
        diamondName: diamond.name,
        iceToCollect: 0,
      },
    },
    { session, upsert: true }
  );

  try {
    await commitWithRetry(session);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
}

export async function stakeSerpentOrDiamond(
  client: MongoClient,
  session: ClientSession,
  mint: string,
  staker: string
) {
  session.startTransaction({
    readConcern: { level: 'snapshot' },
    writeConcern: { w: 'majority' },
    readPreference: ReadPreference.primary,
  });

  const lastStaked = new Date();
  await client
    .db(DIAMONDS_DB)
    .collection(DIAMONDS_COLLECTION)
    .findOneAndUpdate(
      { mint },
      { $set: { isStaked: true, staker, lastStaked } },
      { session }
    );
  await client
    .db(SERPENTS_DB)
    .collection(SERPENTS_COLLECTION)
    .findOneAndUpdate(
      { mint },
      { $set: { isStaked: true, staker, lastStaked } },
      { session }
    );

  try {
    await commitWithRetry(session);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
}

export async function unstakeSerpentOrDiamond(
  client: MongoClient,
  session: ClientSession,
  mint: string
) {
  session.startTransaction({
    readConcern: { level: 'snapshot' },
    writeConcern: { w: 'majority' },
    readPreference: ReadPreference.primary,
  });

  const lastStaked = new Date();
  await client
    .db(DIAMONDS_DB)
    .collection(DIAMONDS_COLLECTION)
    .findOneAndUpdate(
      { mint },
      { $set: { isStaked: false, staker: null, lastStaked } },
      { session }
    );
  await client
    .db(SERPENTS_DB)
    .collection(SERPENTS_COLLECTION)
    .findOneAndUpdate(
      { mint },
      { $set: { isStaked: false, staker: null, lastStaked } },
      { session }
    );

  try {
    await commitWithRetry(session);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
}

export async function zeroOutIceForStaker(
  client: MongoClient,
  session: ClientSession,
  staker: string
) {
  session.startTransaction({
    readConcern: { level: 'snapshot' },
    writeConcern: { w: 'majority' },
    readPreference: ReadPreference.primary,
  });

  await client
    .db(DIAMONDS_DB)
    .collection(DIAMONDS_COLLECTION)
    .updateMany({ staker }, { $set: { iceToCollect: 0, staker } }, { session });

  const serpentsDb = client.db(SERPENTS_DB);
  const now = new Date();

  await serpentsDb.collection(SERPENTS_COLLECTION).updateMany(
    { staker },
    {
      $set: {
        staker,
        lastStaked: now,
        lastPaired: now,
      },
    },
    { session }
  );

  await serpentsDb.collection(PAIRS_COLLECTION).updateMany(
    {
      staker,
      isPaired: true,
    },
    {
      $set: {
        iceToCollect: 0,
        lastPaired: now,
      },
    },
    { session }
  );

  try {
    await commitWithRetry(session);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export { clientPromise };
