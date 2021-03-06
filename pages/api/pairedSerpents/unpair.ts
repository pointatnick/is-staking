import type { NextApiRequest, NextApiResponse } from 'next';
import { getPairedSerpent } from './[publicKey]';
import { getSerpent } from '../serpents';
import { PairedSerpent } from '../types';
import {
  clientPromise,
  runTransactionWithRetry,
  unpairSerpent,
} from '../../../lib/mongodbv2';

type Data = {
  success: boolean;
  iceToCollect?: number;
  errorCode?: number;
};

export async function unpairNfts(pairedSerpent: PairedSerpent) {
  const mongoClient = await clientPromise;
  await runTransactionWithRetry(
    unpairSerpent,
    mongoClient,
    mongoClient.startSession(),
    [pairedSerpent]
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

            return res.status(200).json({ success: true, iceToCollect });
          } else {
            return res.status(400).json({ success: false, errorCode: 3400 });
          }
        } else {
          return res.status(400).json({ success: false, errorCode: 3400 });
        }
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, errorCode: 3500 });
    }
  }

  if (req.method === 'POST') {
    const { publicKey, pairedSerpentMint } = req.body;
    try {
      // get data from db
      const pairedSerpent = await getPairedSerpent(pairedSerpentMint);
      if (pairedSerpent !== null) {
        const userOwnsPair = pairedSerpent.staker === publicKey;
        if (userOwnsPair && pairedSerpent.isPaired) {
          await unpairNfts(pairedSerpent);
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

  return res.status(404).json({ success: false, errorCode: 3405 });
}
