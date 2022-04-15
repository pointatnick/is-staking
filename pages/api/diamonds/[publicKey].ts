import type { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey } from '@solana/web3.js';
import { CONNECTION, METAPLEX_TOKEN_PROGRAM_ID } from '../../../src/config';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { getMintAddresses } from '../data/diamondMintAddresses';

export async function getDiamondsFromWallet(publicKey: PublicKey, present = 1) {
  const mintAddresses = await getMintAddresses();
  // get tokens from wallet
  const tokenAccounts = (
    await CONNECTION.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: METAPLEX_TOKEN_PROGRAM_ID },
      'confirmed'
    )
  ).value;

  const nftMetadatas = await Metadata.findDataByOwner(CONNECTION, publicKey);
  console.log(nftMetadatas);

  return (
    tokenAccounts
      // cross-reference mintAddresses of which the wallet has 1 of
      .filter(
        (account) =>
          mintAddresses.includes(account.account.data.parsed.info.mint) &&
          account.account.data.parsed.info.tokenAmount.uiAmount === present
      )
      // get the mint address
      .map((account) => account.account.data.parsed.info.mint)
  );
}

export type Data = {
  numStaked: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { publicKey } = req.query;
  const user = new PublicKey(publicKey);
  const diamonds = await getDiamondsFromWallet(user);

  res.status(200).json({ numStaked: diamonds.length });
}
