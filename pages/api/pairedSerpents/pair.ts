import type { NextApiRequest, NextApiResponse } from 'next';
import { getSerpent } from '../serpents';
import { getDiamond } from '../diamonds';
import { Diamond, Serpent } from '../types';
import {
  clientPromise,
  pairSerpent,
  runTransactionWithRetry,
} from '../../../lib/mongodbv2';

type Data = {
  success: boolean;
  errorCode?: number;
};

export async function pairNfts(diamond: Diamond, serpent: Serpent) {
  // continue if user owns staked serpent and staked diamond
  // extract unnecessary data from pairedSerpent
  const mongoClient = await clientPromise;
  await runTransactionWithRetry(
    pairSerpent,
    mongoClient,
    mongoClient.startSession(),
    [serpent, diamond]
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { publicKey, serpentMint, diamondMint } = req.body;
    try {
      // get data from db
      const serpent = await getSerpent(serpentMint);
      const diamond = await getDiamond(diamondMint);

      if (serpent !== null && diamond !== null) {
        const userOwnsSerpent = serpent.staker === publicKey;
        const userOwnsDiamond = diamond.staker === publicKey;
        const pairExists = serpent.isPaired || diamond.isPaired;

        if (
          userOwnsSerpent &&
          userOwnsDiamond &&
          serpent.isStaked &&
          diamond.isStaked &&
          !pairExists
        ) {
          await pairNfts(diamond, serpent);
          return res.status(200).json({ success: true });
        } else {
          return res.status(400).json({ success: false, errorCode: 3400 });
        }
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, errorCode: 3500 });
    }
  }

  return res.status(405).json({ success: false, errorCode: 3405 });
}
