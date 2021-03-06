import type { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey } from '@solana/web3.js';
import { SERPENTS_COLLECTION } from '../../../src/config';
import { getTokenAccountsAndMintsFromWallet } from './owned';
import { connectToDatabase } from '../../../lib/mongodb';
import { Serpent } from '../types';
import { getChainSerpents } from '../ice/serpents/[publicKey]';

type Data = {
  stakedSerpents: any[];
};

export async function getStakedSerpentMintsForPublicKey(publicKey: string) {
  const user = new PublicKey(publicKey);
  // get all serpents in DAO
  const daoMints = (await getAllStakedSerpents()).map(
    (serpent) => serpent.mint
  );

  // get all serpents wallet used to have
  const oldSerpentMints = await getTokenAccountsAndMintsFromWallet(user, 0);

  // get all serpents wallet used to have that are in the DAO
  return oldSerpentMints.filter((item) => daoMints.includes(item.mint));
}

export async function getAllStakedSerpents() {
  const { serpentDb: db } = await connectToDatabase();
  const cursor = db
    .collection(SERPENTS_COLLECTION)
    .find<Serpent>({ isStaked: true });
  const serpents = await cursor.toArray();
  cursor.close();
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
