import type { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey } from '@solana/web3.js';
import { DAO_PUBLIC_KEY, DIAMONDS_COLLECTION } from '../../../src/config';
import { getTokenAccountsAndMintsFromWallet } from './owned';
import { getDiamondsFromWallet } from './[publicKey]';
import { connectToDatabase } from '../../../util/mongodb';
import { Serpent } from '../types';

type Data = {
  stakedDiamondMints: { mint: string; tokenAccount: string }[];
  stakedDiamonds: Serpent[];
};

export async function getAllStakedDiamonds() {
  const { diamondDb: db } = await connectToDatabase();
  return await db
    .collection(DIAMONDS_COLLECTION)
    .find({ isStaked: true })
    .toArray();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const user = new PublicKey(req.query.publicKey);
  // get all diamonds in DAO
  const daoMints = await getDiamondsFromWallet(DAO_PUBLIC_KEY);

  // get all diamonds wallet used to have
  const oldDiamondMints = await getTokenAccountsAndMintsFromWallet(user, 0);

  // get all diamonds wallet used to have that are in the DAO
  const diamondMints = oldDiamondMints.filter((item) =>
    daoMints.includes(item.mint)
  );

  res.status(200).json({
    stakedDiamondMints: diamondMints,
    stakedDiamonds: await getAllStakedDiamonds(),
  });
}
