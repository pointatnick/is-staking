import type { NextApiRequest, NextApiResponse } from 'next';

import {
  clientPromise,
  runTransactionWithRetry,
  zeroOutIceForStaker,
} from '../../../lib/mongodbv2';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { publicKey: staker } = req.body;
    try {
      const mongoClient = await clientPromise;
      await runTransactionWithRetry(
        zeroOutIceForStaker,
        mongoClient,
        mongoClient.startSession(),
        [staker]
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  }

  return res.status(404).json(null);
}
