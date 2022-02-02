import { NextApiRequest, NextApiResponse } from 'next';
import { DB_COLLECTION } from '../../../src/config';
import { connectToDatabase } from '../../../util/mongodb';
import { Serpent } from '../types';

export async function getAllStakers() {
  const { db } = await connectToDatabase();
  const serpentsWithStakers = await db
    .collection(DB_COLLECTION)
    .find({ staker: { $ne: null } })
    .toArray();

  return serpentsWithStakers.map((serpent: Serpent) => serpent.staker);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string[] | null>
) {
  try {
    const stakers = await getAllStakers();
    res.status(200).json(stakers);
  } catch (error) {
    res.status(500).json(null);
  }
}
