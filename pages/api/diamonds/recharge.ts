import type { NextApiRequest, NextApiResponse } from 'next';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { Message, PublicKey, Transaction } from '@solana/web3.js';
import { CONNECTION } from '../../../src/config';
import bs58 from 'bs58';
import axios from 'axios';
import { invokeLambda } from '../../../lib/lambda';
import { EnergyCharged } from '../types';

type Data = {
  success: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { staker, signature, txMessage, mint } = req.body;
    // reassemble and send
    const tx = Transaction.populate(Message.from(txMessage.data), [
      bs58.encode(signature.data),
    ]);
    let retries = 0;
    let MAX_RETRIES = 3;

    while (retries < MAX_RETRIES) {
      try {
        const txHash = await CONNECTION.sendRawTransaction(tx.serialize(), {
          preflightCommitment: 'confirmed',
          skipPreflight: false,
        });
        const result = await CONNECTION.confirmTransaction(txHash);
        if (result.value && result.value.err === null) {
          console.log('transaction confirmed', result);
          // get metadata and update it
          const metadata = await generateMetadata(mint);

          // start lambda
          await invokeLambda({ tokenAccount: mint, metadata });

          return res.status(200).json({ success: true });
        }
      } catch (error) {
        console.error(error);
        if (retries === MAX_RETRIES - 1) {
          return res.status(500).json({ success: false });
        }
      } finally {
        retries += 1;
      }
    }
  }

  return res.status(405).json({ success: false });
}

export async function generateMetadata(mint: string) {
  const metadata = await Metadata.load(
    CONNECTION,
    await Metadata.getPDA(new PublicKey(mint))
  );
  const metadataData = (await axios.get(metadata.data.data.uri)).data;
  const newMetadataData = recharge(metadataData);
  return newMetadataData;
}

export function recharge(diamond: any) {
  const energyChargedAttrIndex = diamond.attributes.findIndex(
    (attr: { trait_type: string; value: string }) =>
      attr.trait_type === 'energy charged'
  );
  diamond.attributes[energyChargedAttrIndex].value = EnergyCharged.Charged;
  return diamond;
}
