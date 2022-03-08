import type { NextApiRequest, NextApiResponse } from 'next';
import { updatePairedSerpent } from './[publicKey]';
import { getSerpent, updateSerpent } from '../serpents';
import { getDiamond, updateDiamond } from '../diamonds';
import { Diamond, Serpent } from '../types';

type Data = {
  success: boolean;
  errorCode?: number;
};

export async function pairNfts(diamond: Diamond, serpent: Serpent) {
  // continue if user owns staked serpent and staked diamond
  // extract unnecessary data from pairedSerpent
  const { isStaked, lastStaked, icePerDay, ...pairedSerpent } = serpent;
  const lastPaired = new Date();
  // pair the serpent and diamond
  await updatePairedSerpent(
    { mint: serpent.mint },
    {
      $set: {
        ...pairedSerpent,
        isPaired: true,
        lastPaired,
        diamondMint: diamond.mint,
        diamondRank: diamond.rank,
        diamondImageUrl: diamond.imageUrl,
        diamondName: diamond.name,
        iceToCollect: 0,
      },
    },
    { upsert: true }
  );
  await updateDiamond({ mint: diamond.mint }, { $set: { isPaired: true } });
  await updateSerpent(
    { mint: serpent.mint },
    { $set: { isPaired: true, lastPaired } }
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
        const pairExists = serpent.isPaired || diamond?.isPaired;

        if (
          userOwnsSerpent &&
          userOwnsDiamond &&
          serpent.isStaked &&
          diamond.isStaked &&
          !pairExists
        ) {
          await pairNfts(diamond, serpent);
          res.status(200).json({ success: true });
        } else {
          res.status(400).json({ success: false, errorCode: 3400 });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, errorCode: 3500 });
    }
  } else {
    res.status(405).json({ success: false, errorCode: 3405 });
  }
}
