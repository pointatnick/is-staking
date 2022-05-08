import type { NextApiRequest, NextApiResponse } from 'next';
import { invokeLambda } from '../../../lib/lambda';
import { generateMetadata } from './recharge';

type Data = {
  success: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | null>
) {
  if (req.method === 'POST') {
    const { password, mint } = req.body;

    if (password === 'SuperSecret33#') {
      // get metadata and update it
      const metadata = await generateMetadata(mint);

      // start lambda
      await invokeLambda({ tokenAccount: mint, metadata });

      return res.status(200).json({ success: true });
    }
  }

  return res.status(404).json(null);
}
