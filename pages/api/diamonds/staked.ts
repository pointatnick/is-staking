import type { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey } from '@solana/web3.js';
import {
  CONNECTION,
  DAO_PUBLIC_KEY,
  DIAMONDS_COLLECTION,
} from '../../../src/config';
import { getTokenAccountsAndMintsFromWallet } from './owned';
import { getDiamondsFromWallet } from './[publicKey]';
import { connectToDatabase } from '../../../lib/mongodb';
import { Diamond } from '../types';

type Data = {
  stakedDiamonds: any[];
};

export async function getChainDiamonds(publicKey: string, diamonds: Diamond[]) {
  const mints = diamonds.map((item) => item.mint);
  const stakedDiamondMints = await getStakedDiamondMintsForPublicKey(publicKey);
  const stakedMintsForUser: any[] = [];
  await Promise.all(
    stakedDiamondMints.map(async (item: any) => {
      // for getting metadata from rarityResponse
      const index = mints.indexOf(item.mint);
      const tokenAta = new PublicKey(item.tokenAccount);

      try {
        // get most recent signature for ATA
        const signature = (
          await CONNECTION.getSignaturesForAddress(tokenAta)
        )[0].signature;
        // get tx data
        const tx = await CONNECTION.getConfirmedTransaction(
          signature,
          'confirmed'
        );

        // determine if diamond ended up with DAO in most recent ATA transaction
        if (tx?.meta?.postTokenBalances) {
          for (const balance of tx.meta.postTokenBalances) {
            if (
              balance.owner === DAO_PUBLIC_KEY.toString() &&
              balance.uiTokenAmount.uiAmount === 1
            ) {
              // found a diamond in the DAO from this ATA
              // get metadata
              stakedMintsForUser.push({
                ...item,
                ...diamonds[index],
              });
              break;
            }
          }
        }
      } catch (err) {
        console.error(item.mint, err);
      }
    })
  );

  return stakedMintsForUser;
}

export async function getStakedDiamondMintsForPublicKey(publicKey: string) {
  const user = new PublicKey(publicKey);

  // get all diamonds in DAO
  const daoMints = await getDiamondsFromWallet(DAO_PUBLIC_KEY);

  // get all diamonds wallet used to have
  const oldDiamondMints = await getTokenAccountsAndMintsFromWallet(user, 0);

  // get all diamonds wallet used to have that are in the DAO
  return oldDiamondMints.filter((item) => daoMints.includes(item.mint));
}

export async function getAllStakedDiamonds() {
  const { diamondDb: db } = await connectToDatabase();
  return await db
    .collection(DIAMONDS_COLLECTION)
    .find({ isStaked: true })
    .toArray();
}

export async function getStakedDiamondsForPublicKey(publicKey: string) {
  const allStakedDiamonds = await getAllStakedDiamonds();
  const chainDiamonds = await getChainDiamonds(publicKey, allStakedDiamonds);
  const chainDiamondMints = chainDiamonds.map((x: Diamond) => x.mint);
  // include diamonds whose token accounts may have closed
  const diamonds = allStakedDiamonds.filter(
    (x: Diamond) =>
      x.staker === publicKey && !chainDiamondMints.includes(x.mint)
  );

  return [...chainDiamonds, ...diamonds];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({
    stakedDiamonds: await getStakedDiamondsForPublicKey(
      req.query.publicKey as string
    ),
  });
}
