import type { NextApiRequest, NextApiResponse } from 'next';
import { SERPENTS_COLLECTION } from '../../../src/config';
import { connectToDatabase } from '../../../lib/mongodb';
import type { Serpent } from '../types';
import { Filter, UpdateFilter } from 'mongodb';

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
  filter: Filter<Serpent>,
  update: UpdateFilter<Serpent>
) {
  const { serpentDb: db } = await connectToDatabase();
  await db.collection(SERPENTS_COLLECTION).updateOne(filter, update);
}

export async function stakeOrUnstakeSerpent(
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
  await db.collection(SERPENTS_COLLECTION).updateOne({ mint }, updateDoc);
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
