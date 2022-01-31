import * as bs58 from 'bs58';
import { Message, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { CONNECTION } from '../../../src/config';
import { updateSerpent } from '../serpents';
import nacl from 'tweetnacl';

export default async function handler(req, res) {
  const { txMessage, signature, publicKey, mint } = req.body;
  const user = new PublicKey(publicKey);
  const daoKeypair = Keypair.fromSecretKey(
    bs58.decode(process.env.DAO_PRIVATE_KEY)
  );
  const daoSignature = nacl.sign.detached(
    new Uint8Array(txMessage.data),
    daoKeypair.secretKey
  );
  const transaction = Transaction.populate(Message.from(txMessage.data));
  transaction.addSignature(user, new Uint8Array(signature.data));
  transaction.addSignature(daoKeypair.publicKey, daoSignature);

  try {
    await CONNECTION.sendRawTransaction(transaction.serialize(), {
      skipPreflight: true,
    });
    await updateSerpent(mint, new Date(), true);
    res.status(200).json({ error: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true });
  }
}
