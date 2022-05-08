import type { NextApiRequest, NextApiResponse } from 'next';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { Message, PublicKey, Transaction } from '@solana/web3.js';
import { CONNECTION } from '../../../src/config';
import bs58 from 'bs58';
import axios from 'axios';
import { invokeLambda } from '../../../lib/lambda';
import { generateMetadata } from './recharge';

type Data = {
  success: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
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
