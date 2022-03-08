import { Filter, UpdateFilter, UpdateOptions } from 'mongodb';
import { PAIRS_COLLECTION } from '../../../src/config';
import { connectToDatabase } from '../../../lib/mongodb';
import { PairedSerpent } from '../types';
import type { NextApiRequest, NextApiResponse } from 'next';

export async function getAllPairedSerpents() {
  const { serpentDb: db } = await connectToDatabase();
  const cursor = db.collection(PAIRS_COLLECTION).find<PairedSerpent>({});
  const pairs = await cursor.toArray();
  cursor.close();
  return pairs;
}

export async function getPairedSerpent(mint: string) {
  const { serpentDb: db } = await connectToDatabase();
  return await db.collection(PAIRS_COLLECTION).findOne<PairedSerpent>({ mint });
}

export async function getPairedSerpents(staker: string) {
  const { serpentDb: db } = await connectToDatabase();
  const cursor = db
    .collection(PAIRS_COLLECTION)
    .find<PairedSerpent>({ staker, isPaired: true });
  const docs = await cursor.toArray();
  cursor.close();

  return docs;
}

export async function updatePairedSerpent(
  filter: Filter<PairedSerpent>,
  update: UpdateFilter<PairedSerpent>,
  options: UpdateOptions
) {
  const { serpentDb } = await connectToDatabase();
  await serpentDb
    .collection(PAIRS_COLLECTION)
    .updateOne(filter, update, options);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const publicKey = req.query.publicKey as string;
  const pairedSerpents: PairedSerpent[] = await getPairedSerpents(publicKey);

  res.status(200).json({ pairedSerpents });
}
