import { Filter } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  CONNECTION,
  DIAMONDS_COLLECTION,
  DIAMONDS_DB,
  PAIRS_COLLECTION,
  SERPENTS_COLLECTION,
  SERPENTS_DB,
} from '../../../src/config';
import { Diamond, PairedSerpent, Serpent } from '../types';
import { clientPromise } from '../../../lib/mongodbv2';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

const AUTH_PUBLIC_KEY = 'AbafQE7FfF9fr7wLuaThrjrmk6pbuvi5MyCHH4vTg57D';

// NFTs to this project
export async function getUnstakedNftMints(publicKey: string) {
  const metadata = await Metadata.findDataByOwner(CONNECTION, publicKey);
  return metadata
    .filter((item) => item.updateAuthority === AUTH_PUBLIC_KEY)
    .map((item) => item.mint);
}

export async function getAllSerpents(
  publicKey: string,
  unstakedMints: string[]
) {
  const stakedSerpents = await getSerpents({ staker: publicKey });
  const mongoClient = await clientPromise;
  const unstakedSerpents: Serpent[] = [];
  for (const mint of unstakedMints) {
    const serpent = await mongoClient
      .db(SERPENTS_DB)
      .collection(SERPENTS_COLLECTION)
      .findOne<Serpent>({ mint });
    if (serpent) {
      unstakedSerpents.push(serpent);
    }
  }
  return stakedSerpents.concat(unstakedSerpents);
}

export async function getSerpents(filter: Filter<Serpent>) {
  const mongoClient = await clientPromise;
  const cursor = mongoClient
    .db(SERPENTS_DB)
    .collection(SERPENTS_COLLECTION)
    .find<Serpent>(filter);
  const serpents = await cursor.toArray();
  cursor.close();
  return serpents;
}

export async function getAllDiamonds(
  publicKey: string,
  unstakedMints: string[]
) {
  const stakedDiamonds = await getDiamonds({ staker: publicKey });
  const mongoClient = await clientPromise;
  const unstakedDiamonds: Diamond[] = [];
  for (const mint of unstakedMints) {
    const diamond = await mongoClient
      .db(DIAMONDS_DB)
      .collection(DIAMONDS_COLLECTION)
      .findOne<Diamond>({ mint });
    if (diamond) {
      unstakedDiamonds.push(diamond);
    }
  }
  return stakedDiamonds.concat(unstakedDiamonds);
}

export async function getDiamonds(filter: Filter<Diamond>) {
  const client = await clientPromise;
  const cursor = client
    .db(DIAMONDS_DB)
    .collection(DIAMONDS_COLLECTION)
    .find<Diamond>(filter);
  const diamonds = await cursor.toArray();
  cursor.close();
  return diamonds;
}

export async function getPairedSerpents(filter: Filter<Diamond>) {
  const client = await clientPromise;
  const cursor = client
    .db(SERPENTS_DB)
    .collection(PAIRS_COLLECTION)
    .find<PairedSerpent>(filter);
  const pairedSerpents = await cursor.toArray();
  cursor.close();
  return pairedSerpents;
}

function calculateIce(
  serpents: Serpent[],
  diamonds: Diamond[],
  pairedSerpents: PairedSerpent[]
) {
  const serpentsIce = serpents.reduce((prev: number, cur: Serpent) => {
    if (cur.isMolting) {
      // molting serpents don't produce ICE
      return 0;
    }

    const icePerSecond = cur.icePerDay / 24 / 60 / 60;
    // asserting dates could cause issues
    let stakedDate = Date.parse(new Date().toISOString());
    let old = Date.parse(new Date().toISOString());
    if (cur.lastStaked) {
      stakedDate = Date.parse(cur.lastStaked.toISOString());
      old =
        cur.lastPaired &&
        cur.lastPaired !== undefined &&
        cur.lastPaired !== null &&
        cur.isPaired
          ? Date.parse(cur.lastPaired.toISOString())
          : old;
    }

    let diff = old - stakedDate;

    // use diff to calculate ICE so far
    let seconds = Math.floor(diff / 1000);
    return prev + icePerSecond * seconds;
  }, 0);
  const diamondsIce = diamonds.reduce((prev: number, cur: Diamond) => {
    return prev + cur.iceToCollect;
  }, 0);
  const pairedSerpentsIce = pairedSerpents.reduce(
    (prev: number, cur: PairedSerpent) => prev + cur.iceToCollect,
    0
  );
  console.log('ice from serpents', serpentsIce);
  console.log('ice from diamonds', diamondsIce);
  console.log('ice from paired serpents', pairedSerpentsIce);

  return serpentsIce + diamondsIce + pairedSerpentsIce;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const publicKey = req.query.publicKey as string;
    const unstakedNfts = await getUnstakedNftMints(publicKey);
    console.log(unstakedNfts);
    const serpents = await getAllSerpents(publicKey, unstakedNfts);
    const diamonds = await getAllDiamonds(publicKey, unstakedNfts);
    const pairedSerpents = await getPairedSerpents({
      staker: publicKey,
      isPaired: true,
    });
    const ice = calculateIce(serpents, diamonds, pairedSerpents);
    return res.status(200).json({ serpents, diamonds, pairedSerpents, ice });
  }

  return res.status(404).json(null);
}
