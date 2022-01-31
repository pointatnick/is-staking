import type { NextApiRequest, NextApiResponse } from 'next';
import { getSerpent } from '../serpents';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ice: number }>
) {
  const { mint } = req.query;
  const { lastStaked, icePerDay } = await getSerpent(mint as string);

  const icePerSecond = icePerDay / 24 / 60 / 60;
  const stakedDate = Date.parse(lastStaked);
  const nowDate = new Date().toISOString();
  const now = Date.parse(nowDate);

  // use diff to calculate ICE so far
  const diff = now - stakedDate;
  const seconds = Math.floor(diff / 1000);
  const ice = icePerSecond * seconds;

  res.status(200).json({ ice });
}
