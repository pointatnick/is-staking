// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Data } from './[publicKey]';
import { getAllStakedSerpents } from './staked';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const serpents = await getAllStakedSerpents();

  res.status(200).json({ numStaked: serpents.length });
}
