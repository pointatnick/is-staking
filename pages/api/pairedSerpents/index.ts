import { Filter, UpdateFilter, UpdateOptions } from 'mongodb';
import { PAIRS_COLLECTION } from '../../../src/config';
import { connectToDatabase } from '../../../util/mongodb';
import { PairedSerpent } from '../types';

export async function getAllPairedSerpents() {
  const { serpentDb: db } = await connectToDatabase();
  const pairs = await db.collection(PAIRS_COLLECTION).find({}).toArray();
  console.log(pairs);
  return pairs;
}

export async function getPairedSerpents(diamondMint: string) {
  const { serpentDb: db } = await connectToDatabase();
  return await db.collection(PAIRS_COLLECTION).findOne({ diamondMint });
}

export async function updatePairedSerpent(
  filter: Filter<PairedSerpent>,
  update: UpdateFilter<PairedSerpent>,
  options: UpdateOptions | null = null
) {
  console.log('updating', filter, update);
  const { serpentDb: db } = await connectToDatabase();
  await db.collection(PAIRS_COLLECTION).updateOne(filter, update, options);
}
