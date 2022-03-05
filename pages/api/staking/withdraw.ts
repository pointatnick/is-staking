import type { NextApiRequest, NextApiResponse } from 'next';
import * as bs58 from 'bs58';
import { Message, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { CONNECTION } from '../../../src/config';
import nacl from 'tweetnacl';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ error: boolean }>
) {
  const { txMessage, signature, publicKey } = req.body;

  // send ICE to user
  const user = new PublicKey(publicKey);
  const daoKeypair = Keypair.fromSecretKey(
    bs58.decode(process.env.DAO_PRIVATE_KEY!)
  );
  const daoSignature = nacl.sign.detached(
    new Uint8Array(txMessage.data),
    daoKeypair.secretKey
  );
  const transaction = Transaction.populate(Message.from(txMessage.data));
  console.log(transaction);
  transaction.addSignature(user, signature.data);
  transaction.addSignature(daoKeypair.publicKey, Buffer.from(daoSignature));

  // TODO: retry transactions
  try {
    await CONNECTION.sendRawTransaction(transaction.serialize());
    res.status(200).json({ error: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true });
  }
}
