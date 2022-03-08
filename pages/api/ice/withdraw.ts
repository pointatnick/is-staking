import type { NextApiRequest, NextApiResponse } from 'next';
import { Diamond } from '../types';
import { Filter, UpdateFilter } from 'mongodb';
import {
  DIAMONDS_COLLECTION,
  PAIRS_COLLECTION,
  SERPENTS_COLLECTION,
} from '../../../src/config';
import { connectToDatabase } from '../../../lib/mongodb';
import { updateDiamond } from '../diamonds';
import { updateSerpent } from '../serpents';
import { getStakedDiamondsForPublicKey } from '../diamonds/staked';
import { getStakedSerpentsForPublicKey } from '../serpents/staked';

export async function updateDiamondsForStaker(
  filter: Filter<Diamond>,
  update: UpdateFilter<Diamond>
) {
  const { diamondDb: db } = await connectToDatabase();
  //@ts-ignore
  await db.collection(DIAMONDS_COLLECTION).updateMany(filter, update);
}

export async function updateSerpentsForStaker(
  filter: Filter<Diamond>,
  update: UpdateFilter<Diamond>
) {
  const { serpentDb: db } = await connectToDatabase();
  //@ts-ignore
  await db.collection(SERPENTS_COLLECTION).updateMany(filter, update);
}

export async function updatePairedSerpentsForStaker(
  filter: Filter<Diamond>,
  update: UpdateFilter<Diamond>
) {
  const { serpentDb: db } = await connectToDatabase();
  //@ts-ignore
  await db.collection(PAIRS_COLLECTION).updateMany(filter, update);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const publicKey = req.body.publicKey as string;
    try {
      let filter = { staker: publicKey, isStaked: true };
      let update: UpdateFilter<Diamond> = {
        $set: { iceToCollect: 0, staker: publicKey },
      };
      const now = new Date();
      await updateDiamondsForStaker(filter, update);
      await updateSerpentsForStaker(filter, {
        $set: {
          staker: publicKey,
          lastStaked: now,
          lastPaired: now,
        },
      });
      await updatePairedSerpentsForStaker(
        {
          staker: publicKey,
          isPaired: true,
        },
        {
          $set: {
            iceToCollect: 0,
            staker: publicKey,
            lastPaired: now,
          },
        }
      );

      // there may be some NFTs left over whose staker is not recorded in DB
      const diamonds = await getStakedDiamondsForPublicKey(publicKey);
      const serpents = await getStakedSerpentsForPublicKey(publicKey);
      for (const { mint } of diamonds) {
        await updateDiamond({ mint }, update);
      }
      for (const { mint } of serpents) {
        await updateSerpent(
          { mint },
          {
            $set: {
              staker: publicKey,
              lastStaked: now,
              lastPaired: now,
            },
          }
        );
      }

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error });
    }
  } else {
    res.status(404);
  }
}
