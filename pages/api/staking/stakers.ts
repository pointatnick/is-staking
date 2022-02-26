import { NextApiRequest, NextApiResponse } from 'next';
import { SERPENTS_COLLECTION } from '../../../src/config';
import { connectToDatabase } from '../../../lib/mongodb';
import { Serpent } from '../types';

export async function getAllStakers() {
  const { serpentDb: db } = await connectToDatabase();
  const serpentsWithStakers = await db
    .collection(SERPENTS_COLLECTION)
    .find({ staker: { $ne: null } })
    .toArray();

  return serpentsWithStakers.map((serpent: Serpent) => serpent.staker);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ [key: string]: number } | null>
) {
  try {
    const stakers = await getAllStakers();
    let stakersDict: { [key: string]: number } = {};
    stakers.forEach((staker: string) => {
      if (stakersDict[staker]) {
        stakersDict[staker] += 1;
      } else {
        stakersDict[staker] = 1;
      }
    });

    res.status(200).json(stakersDict);
  } catch (error) {
    console.error(error);
    res.status(500).json(null);
  }
}
