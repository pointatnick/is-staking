import type { NextApiRequest, NextApiResponse } from 'next';
import { getStakedDiamondsForPublicKey } from '../../diamonds/staked';
import { Diamond } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { publicKey } = req.query;
  let diamonds = await getStakedDiamondsForPublicKey(publicKey as string);
  let reducer = (prev: number, cur: Diamond) => prev + cur.iceToCollect;
  let ice = diamonds.reduce(reducer, 0);
  console.log('diamonds', ice);
  res.status(200).json({ ice });
}
