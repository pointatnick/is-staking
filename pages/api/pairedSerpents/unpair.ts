import type { NextApiRequest, NextApiResponse } from 'next';
import { getPairedSerpent, updatePairedSerpent } from './[publicKey]';
import { getSerpent, updateSerpent } from '../serpents';
import { updateDiamond } from '../diamonds';
import { PairedSerpent } from '../types';

type Data = {
  success: boolean;
  iceToCollect?: number;
  errorCode?: number;
};

export async function unpairNfts(pairedSerpent: PairedSerpent) {
  await updatePairedSerpent(
    { mint: pairedSerpent.mint },
    { $set: { isPaired: false, iceToCollect: 0 } },
    { upsert: false }
  );
  await updateDiamond(
    { mint: pairedSerpent.diamondMint },
    { $set: { isPaired: false } }
  );
  await updateSerpent(
    { mint: pairedSerpent.mint },
    { $set: { isPaired: false, lastPaired: undefined, lastStaked: new Date() } }
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'GET') {
    const { publicKey, pairedSerpentMint } = req.query;
    try {
      // get data from db
      const pairedSerpent = await getPairedSerpent(pairedSerpentMint as string);
      if (pairedSerpent !== null) {
        const userOwnsPair = pairedSerpent.staker === publicKey;

        if (userOwnsPair && pairedSerpent.isPaired) {
          // on unpairing, give back ICE from regular staked serpent too
          const serpent = await getSerpent(pairedSerpentMint as string);

          if (serpent != null) {
            const icePerSecond = serpent.icePerDay / 24 / 60 / 60;
            //@ts-ignore
            const stakedDate = Date.parse(serpent.lastStaked.toISOString());
            //@ts-ignore
            const old = Date.parse(serpent.lastPaired.toISOString());
            let diff = old - stakedDate;
            let seconds = Math.floor(diff / 1000);
            let serpentIce = icePerSecond * seconds;
            let iceToCollect = pairedSerpent.iceToCollect + serpentIce;

            res.status(200).json({ success: true, iceToCollect });
          } else {
            res.status(400).json({ success: false, errorCode: 3400 });
          }
        } else {
          res.status(400).json({ success: false, errorCode: 3400 });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, errorCode: 3500 });
    }
  } else if (req.method === 'POST') {
    const { publicKey, pairedSerpentMint } = req.body;
    try {
      // get data from db
      const pairedSerpent = await getPairedSerpent(pairedSerpentMint);
      if (pairedSerpent !== null) {
        const userOwnsPair = pairedSerpent.staker === publicKey;
        if (userOwnsPair && pairedSerpent.isPaired) {
          await unpairNfts(pairedSerpent);
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
