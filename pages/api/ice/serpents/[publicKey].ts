import { PublicKey } from '@solana/web3.js';
import type { NextApiRequest, NextApiResponse } from 'next';
import { CONNECTION, DAO_PUBLIC_KEY } from '../../../../src/config';
import { getAllSerpents } from '../../serpents';
import { getStakedSerpentMintsForPublicKey } from '../../serpents/staked';
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
              balance.owner === DAO_PUBLIC_KEY.toString() &&
              balance.uiTokenAmount.uiAmount === 1
            ) {
              // found a diamond in the DAO from this ATA
              // get metadata
              const {
                rank,
                name,
                imageUrl,
                lastStaked,
                isStaked,
                icePerDay,
                isPaired,
              } = serpents[index];

              let iceToCollect = 0;
              if (lastStaked && isStaked && !isPaired) {
                // calculate each serpent's iceToCollect
                // ignored paired ones here, that's calculated in the paired section
                let icePerSecond = icePerDay / 24 / 60 / 60;
                let nowDate = new Date().toISOString();
                let stakedDate = Date.parse(lastStaked.toISOString());
                let now = Date.parse(nowDate);
                let diff = now - stakedDate;

                // use diff to calculate ICE so far
                let seconds = Math.floor(diff / 1000);
                iceToCollect = icePerSecond * seconds;
              }
              stakedMintsForUser.push({
                ...item,
                rank,
                name,
                imageUrl,
                lastStaked,
                isStaked,
                isPaired,
                iceToCollect,
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
  const serpents = await getAllSerpents();
  const chainSerpents = await getChainSerpents(publicKey as string, serpents);
  const reducer = (prev: number, cur: any) => prev + cur.iceToCollect;
  let chainSerpentsIce = chainSerpents
    .filter((x: Serpent) => !x.isPaired)
    .reduce(reducer, 0);
  let chainDiamondMints = chainSerpents.map((x: any) => x.mint);
  // supplement incomplete chain data + db data
  let ice =
    chainSerpentsIce +
    serpents
      .filter(
        (x: Serpent) =>
          x.staker === publicKey &&
          x.isStaked &&
          !x.isPaired &&
          !chainDiamondMints.includes(x.mint)
      )
      .reduce(reducer, 0);
  console.log('serpents', ice);
  res.status(200).json({ ice });
}
