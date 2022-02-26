import { Filter, UpdateFilter } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';
import { DIAMONDS_COLLECTION } from '../../../src/config';
import { connectToDatabase } from '../../../lib/mongodb';
import type { Diamond } from '../types';

export async function getAllDiamonds() {
  const { diamondDb: db } = await connectToDatabase();
  return await db.collection(DIAMONDS_COLLECTION).find({}).toArray();
}

export async function getDiamond(mint: string) {
  const { diamondDb: db } = await connectToDatabase();
  return await db.collection(DIAMONDS_COLLECTION).findOne({ mint });
}

export async function stakeOrUnstakeDiamond(
  mint: string,
  lastStaked: Date,
  isStaked: boolean,
  staker: string | null
) {
  const { diamondDb: db } = await connectToDatabase();
  const updateDoc = {
    $set: {
      lastStaked,
      isStaked,
      staker,
    },
  };
  await db.collection(DIAMONDS_COLLECTION).updateOne({ mint }, updateDoc);
}

export async function updateDiamond(
  filter: Filter<Diamond>,
  update: UpdateFilter<Diamond>
) {
  const { diamondDb: db } = await connectToDatabase();
  await db.collection(DIAMONDS_COLLECTION).updateOne(filter, update);
}

type Data = {
  diamonds: Diamond[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const diamonds = await getAllDiamonds();
  res.status(200).json({ diamonds });
}
