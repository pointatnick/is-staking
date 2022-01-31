import type { NextApiRequest, NextApiResponse } from 'next';
import { Message, PublicKey, Transaction } from '@solana/web3.js';
import { updateSerpent } from '../serpents';
import { CONNECTION } from '../../../src/config';

type Data = {
  success: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { publicKey, signature, txMessage, mint } = req.body;
    const user = new PublicKey(publicKey);
    try {
      // reassemble and send
      const tx = Transaction.populate(Message.from(txMessage.data));
      tx.addSignature(user, signature.data);
      await CONNECTION.sendRawTransaction(tx.serialize());

      // write time of staking
      await updateSerpent(mint, new Date(), true);

      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false });
    }
  } else {
    res.status(405).json({ success: false });
  }
}
