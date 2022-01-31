import type { NextApiRequest, NextApiResponse } from 'next';
import { DB_COLLECTION } from '../../../src/config';
import { connectToDatabase } from '../../../util/mongodb';
import type { Serpent } from '../types';

export async function getAllSerpents() {
  const { db } = await connectToDatabase();
  const serpents = await db.collection(DB_COLLECTION).find({}).toArray();
  return serpents;
}

export async function getSerpent(mint: string) {
  const { db } = await connectToDatabase();
  return await db.collection(DB_COLLECTION).findOne({ mint });
}

export async function updateSerpent(
  mint: string,
  lastStaked: Date,
  isStaked: true
) {
  const { db } = await connectToDatabase();
  const updateDoc = {
    $set: {
      lastStaked,
      isStaked,
    },
  };
  await db
    .collection(DB_COLLECTION)
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
