import type { NextApiRequest, NextApiResponse } from 'next';
import { SERPENTS_COLLECTION } from '../../../src/config';
import { connectToDatabase } from '../../../util/mongodb';
import type { Serpent } from '../types';

export async function getAllSerpents() {
  const { serpentDb: db } = await connectToDatabase();
  const serpents = await db.collection(SERPENTS_COLLECTION).find({}).toArray();
  return serpents;
}

export async function getSerpent(mint: string) {
  const { serpentDb: db } = await connectToDatabase();
  return await db.collection(SERPENTS_COLLECTION).findOne({ mint });
}

export async function updateSerpent(
  mint: string,
  lastStaked: Date,
  isStaked: boolean,
  staker: string | null
) {
  const { serpentDb: db } = await connectToDatabase();
  const updateDoc = {
    $set: {
      lastStaked,
      isStaked,
      staker,
    },
  };
  await db
    .collection(SERPENTS_COLLECTION)
    .updateOne({ mint }, updateDoc, { upsert: true });
}

type Data = {
  serpents: Serpent[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const serpents = await getAllSerpents();
  res.status(200).json({ serpents });
}
