import type { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey } from '@solana/web3.js';
import { DAO_PUBLIC_KEY, SERPENTS_COLLECTION } from '../../../src/config';
import { getTokenAccountsAndMintsFromWallet } from './owned';
import { getSerpentsFromWallet } from './[publicKey]';
import { connectToDatabase } from '../../../util/mongodb';
import { Serpent } from '../types';

type Data = {
  stakedSerpentMints: { mint: string; tokenAccount: string }[];
  stakedSerpents: Serpent[];
};

export async function getAllStakedSerpents() {
  const { serpentDb: db } = await connectToDatabase();
  const serpents = await db
    .collection(SERPENTS_COLLECTION)
    .find({ isStaked: true })
    .toArray();
  return serpents;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const user = new PublicKey(req.query.publicKey);
  // get all serpents in DAO
  const daoMints = await getSerpentsFromWallet(DAO_PUBLIC_KEY);

  // get all serpents wallet used to have
  const oldSerpentMints = await getTokenAccountsAndMintsFromWallet(user, 0);

  // get all serpents wallet used to have that are in the DAO
  const serpentMints = oldSerpentMints.filter((item) =>
    daoMints.includes(item.mint)
  );

  const stakedSerpents = await getAllStakedSerpents();

  res.status(200).json({ stakedSerpentMints: serpentMints, stakedSerpents });
}
