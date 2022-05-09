import type { NextApiRequest, NextApiResponse } from 'next';
import * as bs58 from 'bs58';
import { Message, Keypair, Transaction } from '@solana/web3.js';
import { CONNECTION } from '../../../src/config';
import nacl from 'tweetnacl';
import {
  clientPromise,
  runTransactionWithRetry,
  zeroOutIceForStaker,
} from '../../../lib/mongodbv2';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ error: boolean }>
) {
  const { txMessage, signature, publicKey } = req.body;

  // send ICE to user
  const daoKeypair = Keypair.fromSecretKey(
    bs58.decode(process.env.DAO_PRIVATE_KEY!)
  );
  const daoSignature = nacl.sign.detached(
    new Uint8Array(txMessage.data),
    daoKeypair.secretKey
  );
  const tx = Transaction.populate(Message.from(txMessage.data), [
    bs58.encode(signature.data),
    bs58.encode(daoSignature),
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
        await withdrawIce(publicKey);
        return res.status(200).json({ error: false });
      }
    } catch (error) {
      console.error(error);
      if (retries === MAX_RETRIES - 1) {
        return res.status(500).json({ error: true });
      }
    } finally {
      retries += 1;
    }
  }
}

export async function withdrawIce(staker: string) {
  const mongoClient = await clientPromise;
  await runTransactionWithRetry(
    zeroOutIceForStaker,
    mongoClient,
    mongoClient.startSession(),
    [staker]
  );
}
