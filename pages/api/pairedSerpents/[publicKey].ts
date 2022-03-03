import { Filter, UpdateFilter, UpdateOptions } from 'mongodb';
import {
  DIAMONDS_COLLECTION,
  PAIRS_COLLECTION,
  SERPENTS_COLLECTION,
} from '../../../src/config';
import { connectToDatabase } from '../../../lib/mongodb';
import { Diamond, PairedSerpent } from '../types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllStakedDiamonds } from '../diamonds/staked';

export async function getAllPairedSerpents() {
  const { serpentDb: db } = await connectToDatabase();
  const pairs = await db.collection(PAIRS_COLLECTION).find({}).toArray();
  return pairs;
}

// export async function getPairedSerpents(diamondMint: string) {
//   const { serpentDb: db } = await connectToDatabase();
//   return await db.collection(PAIRS_COLLECTION).findOne({ diamondMint });
// }

export async function getPairedSerpents(staker: string) {
  const { serpentDb: db } = await connectToDatabase();
  return await db.collection(PAIRS_COLLECTION).find({ staker }).toArray();
}

export async function updatePairedSerpent(
  filter: Filter<PairedSerpent>,
  update: UpdateFilter<PairedSerpent>,
  options: UpdateOptions | null = null
) {
  // console.log('updating', filter, update);
  const { serpentDb, diamondDb } = await connectToDatabase();
  await serpentDb
    .collection(PAIRS_COLLECTION)
    .updateOne(filter, update, options);
  // todo: update serpent and diamond isPaired = true
  // await serpentDb
  //   .collection(SERPENTS_COLLECTION)
  //   .updateOne(filter, update, options);
  // await diamondDb
  //   .collection(DIAMONDS_COLLECTION)
  //   .updateOne(filter, update, options);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const publicKey = req.query.publicKey as string;
  const pairedSerpents: PairedSerpent[] = await getPairedSerpents(publicKey);

  res.status(200).json({ pairedSerpents });
}
