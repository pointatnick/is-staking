import type { NextApiRequest, NextApiResponse } from 'next';
import { updatePairedSerpent } from '../pairedSerpents';
import { getSerpent } from '../serpents';
import { getDiamond } from '../diamonds';

type Data = {
  success: boolean;
  errorCode?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { publicKey, serpentMint, diamondMint } = req.body;
    try {
      // get data from db
      const serpent = await getSerpent(serpentMint);
      // console.log(serpent);
      const diamond = await getDiamond(diamondMint);
      // console.log(diamond);
      const userOwnsSerpent = serpent.staker === publicKey;
      const userOwnsDiamond = diamond.staker === publicKey;
      if (
        userOwnsSerpent &&
        userOwnsDiamond &&
        serpent.isStaked &&
        diamond.isStaked
      ) {
        // continue if user owns staked serpent and staked diamond
        // extract unnecessary data from pairedSerpent
        const { isStaked, lastStaked, icePerDay, ...pairedSerpent } = serpent;
        // pair the serpent and diamond
        await updatePairedSerpent(
          { mint: serpentMint },
          {
            $set: {
              ...pairedSerpent,
              isPaired: true,
              lastPaired: new Date(),
              diamondMint,
              diamondRank: diamond.rank,
              iceToCollect: 0,
            },
          },
          { upsert: true }
        );
        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ success: false, errorCode: 3400 });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, errorCode: 3500 });
    }
  } else {
    res.status(405).json({ success: false, errorCode: 3405 });
  }
}
