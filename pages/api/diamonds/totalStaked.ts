// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Data } from './[publicKey]';
import { getAllStakedDiamonds } from './staked';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const diamonds = await getAllStakedDiamonds();

  res.status(200).json({ numStaked: diamonds.length });
}
