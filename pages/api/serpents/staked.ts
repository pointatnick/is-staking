import type { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey } from '@solana/web3.js';
import { DAO_PUBLIC_KEY, SERPENTS_COLLECTION } from '../../../src/config';
import { getTokenAccountsAndMintsFromWallet } from './owned';
import { getSerpentsFromWallet } from './[publicKey]';
import { connectToDatabase } from '../../../lib/mongodb';
import { Serpent } from '../types';
import { getChainSerpents } from '../ice/serpents/[publicKey]';

type Data = {
  stakedSerpents: any[];
};

export async function getStakedSerpentMintsForPublicKey(publicKey: string) {
  const user = new PublicKey(publicKey);
  // get all serpents in DAO
  const daoMints = await getSerpentsFromWallet(DAO_PUBLIC_KEY);

  // get all serpents wallet used to have
  const oldSerpentMints = await getTokenAccountsAndMintsFromWallet(user, 0);

  // get all serpents wallet used to have that are in the DAO
  return oldSerpentMints.filter((item) => daoMints.includes(item.mint));
}

export async function getAllStakedSerpents() {
  const { serpentDb: db } = await connectToDatabase();
  const serpents = await db
    .collection(SERPENTS_COLLECTION)
    .find({ isStaked: true })
    .toArray();
  return serpents;
}

export async function getStakedSerpentsForPublicKey(publicKey: string) {
  const allStakedSerpents = await getAllStakedSerpents();
  const chainSerpents = await getChainSerpents(publicKey, allStakedSerpents);
  const chainSerpentMints = chainSerpents.map((x: Serpent) => x.mint);
  // include diamonds whose token accounts may have closed
  const serpents = allStakedSerpents.filter(
    (x: Serpent) =>
      x.staker === publicKey && !chainSerpentMints.includes(x.mint)
  );

  return [...chainSerpents, ...serpents];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({
    stakedSerpents: await getStakedSerpentsForPublicKey(
      req.query.publicKey as string
    ),
  });
}
