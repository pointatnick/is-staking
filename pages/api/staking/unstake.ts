import type { NextApiRequest, NextApiResponse } from 'next';
import * as bs58 from 'bs58';
import { Message, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { CONNECTION } from '../../../src/config';
import { updateSerpent } from '../serpents';
import nacl from 'tweetnacl';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ error: boolean }>
) {
  const { txMessage, signature, publicKey, mint } = req.body;
  const user = new PublicKey(publicKey);
  const daoKeypair = Keypair.fromSecretKey(
    bs58.decode(process.env.DAO_PRIVATE_KEY!)
  );
  const daoSignature = nacl.sign.detached(
    new Uint8Array(txMessage.data),
    daoKeypair.secretKey
  );
  const transaction = Transaction.populate(Message.from(txMessage.data));
  transaction.addSignature(user, signature.data);
  transaction.addSignature(daoKeypair.publicKey, Buffer.from(daoSignature));

  try {
    await CONNECTION.sendRawTransaction(transaction.serialize());
    await updateSerpent(mint, new Date(), false, null);
    // TODO: check if pairedSerpent, in that case, set isPaired to false and zero out iceToCollect
    res.status(200).json({ error: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true });
  }
}
