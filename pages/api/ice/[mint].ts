import type { NextApiRequest, NextApiResponse } from 'next';
import { getSerpent } from '../serpents';

export async function getIce(mint: string) {
  const serpent = await getSerpent(mint);
  if (!serpent) {
    return 0;
  }
  const { lastStaked, icePerDay } = serpent;
  if (!lastStaked) {
    return 0;
  }
  const icePerSecond = icePerDay / 24 / 60 / 60;
  //@ts-ignore
  const stakedDate = Date.parse(lastStaked);
  const nowDate = new Date().toISOString();
  const now = Date.parse(nowDate);

  // use diff to calculate ICE so far
  const diff = now - stakedDate;
  const seconds = Math.floor(diff / 1000);
  return icePerSecond * seconds;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ice: number }>
) {
  const { mint } = req.query;
  const ice = await getIce(mint as string);
  res.status(200).json({ ice });
}
