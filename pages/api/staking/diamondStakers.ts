import { NextApiRequest, NextApiResponse } from 'next';
import { DIAMONDS_COLLECTION } from '../../../src/config';
import { connectToDatabase } from '../../../lib/mongodb';
import { Diamond } from '../types';

export async function getAllStakers() {
  const { diamondDb: db } = await connectToDatabase();
  const cursor = db
    .collection(DIAMONDS_COLLECTION)
    .find<Diamond>({ staker: { $ne: null } });
  const diamondsWithStakers = await cursor.toArray();
  cursor.close();

  return diamondsWithStakers.map((item) => item.staker);
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
