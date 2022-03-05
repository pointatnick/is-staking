import { PublicKey } from '@solana/web3.js';
import type { NextApiRequest, NextApiResponse } from 'next';
import { CONNECTION, DAO_PUBLIC_KEY } from '../../../../src/config';
import {
  getStakedSerpentMintsForPublicKey,
  getStakedSerpentsForPublicKey,
} from '../../serpents/staked';
import { Serpent } from '../../types';

export async function getChainSerpents(publicKey: string, serpents: Serpent[]) {
  const mints = serpents.map((item) => item.mint);
  const stakedSerpentMints = await getStakedSerpentMintsForPublicKey(publicKey);
  const stakedMintsForUser: any[] = [];
  await Promise.all(
    stakedSerpentMints.map(async (item: any) => {
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
              balance.owner === DAO_PUBLIC_KEY.toBase58() &&
              balance.uiTokenAmount.uiAmount === 1
            ) {
              // found a diamond in the DAO from this ATA
              // get metadata
              const {
                rank,
                name,
                imageUrl,
                lastStaked,
                lastPaired,
                isStaked,
                icePerDay,
                isPaired,
              } = serpents[index];

              stakedMintsForUser.push({
                ...item,
                rank,
                name,
                imageUrl,
                lastStaked,
                lastPaired,
                isStaked,
                isPaired,
                icePerDay,
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { publicKey } = req.query;
  const serpents = await getStakedSerpentsForPublicKey(publicKey as string);
  const reducer = (prev: number, cur: any) => {
    const icePerSecond = cur.icePerDay / 24 / 60 / 60;
    const stakedDate = Date.parse(cur.lastStaked.toISOString());
    console.log(cur);
    const old = cur.isPaired
      ? Date.parse(cur.lastPaired.toISOString())
      : Date.parse(new Date().toISOString());
    let diff = old - stakedDate;

    // use diff to calculate ICE so far
    let seconds = Math.floor(diff / 1000);
    return prev + icePerSecond * seconds;
  };

  const ice = serpents.reduce(reducer, 0);
  console.log('serpents', ice);
  res.status(200).json({ ice });
}
