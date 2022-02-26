import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllPairedSerpents } from '../../pairedSerpents';
import { Diamond } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { publicKey } = req.query;
  const pairedSerpents = await getAllPairedSerpents();
  console.log(pairedSerpents);
  const reducer = (prev: number, cur: Diamond) => prev + cur.iceToCollect;
  // supplement incomplete chain data + db data
  let ice = pairedSerpents
    .filter((x: Diamond) => x.staker === publicKey && x.isPaired)
    .reduce(reducer, 0);
  console.log('pairs', ice);
  res.status(200).json({ ice });
}
