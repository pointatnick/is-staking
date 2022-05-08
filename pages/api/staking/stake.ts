import type { NextApiRequest, NextApiResponse } from 'next';
import { Message, Transaction } from '@solana/web3.js';
import { CONNECTION } from '../../../src/config';
import bs58 from 'bs58';
import {
  clientPromise,
  runTransactionWithRetry,
  stakeSerpentOrDiamond,
} from '../../../lib/mongodbv2';

type Data = {
  success: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { staker, signature, txMessage, mint } = req.body;
    // reassemble and send
    const tx = Transaction.populate(Message.from(txMessage.data), [
      bs58.encode(signature.data),
    ]);
    let retries = 0;
    let MAX_RETRIES = 3;

    while (retries < MAX_RETRIES) {
      try {
        const txHash = await CONNECTION.sendRawTransaction(tx.serialize(), {
          preflightCommitment: 'confirmed',
          skipPreflight: false,
        });
        const result = await CONNECTION.confirmTransaction(txHash);
        if (result.value && result.value.err === null) {
          console.log('transaction confirmed', result);
          const mongoClient = await clientPromise;
          await runTransactionWithRetry(
            stakeSerpentOrDiamond,
            mongoClient,
            mongoClient.startSession(),
            [mint, staker]
          );

          return res.status(200).json({ success: true });
        }
      } catch (error) {
        console.error(error);
        if (retries === MAX_RETRIES - 1) {
          return res.status(500).json({ success: false });
        }
      } finally {
        retries += 1;
      }
    }
  }

  return res.status(404).json({ success: false });
}
