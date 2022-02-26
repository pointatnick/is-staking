import type { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey } from '@solana/web3.js';
import { CONNECTION, METAPLEX_TOKEN_PROGRAM_ID } from '../../../src/config';
import { getMintAddresses } from '../data/diamondMintAddresses';

export async function getTokenAccountsAndMintsFromWallet(
  publicKey: PublicKey,
  present = 1
) {
  const mintAddresses = await getMintAddresses();
  // get tokens from wallet
  const tokenAccounts = (
    await CONNECTION.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: METAPLEX_TOKEN_PROGRAM_ID },
      'confirmed'
    )
  ).value;

  return (
    tokenAccounts
      // cross-reference mintAddresses of which the wallet has 1 of
      .filter(
        (account) =>
          mintAddresses.includes(account.account.data.parsed.info.mint) &&
          account.account.data.parsed.info.tokenAmount.uiAmount === present
      )
      // get the mint address
      .map((account) => ({
        mint: account.account.data.parsed.info.mint,
        tokenAccount: account.pubkey.toBase58(),
      }))
  );
}

type Data = {
  diamondMints: { mint: string; tokenAccount: string }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const user = new PublicKey(req.query.publicKey);
  const diamondMints = await getTokenAccountsAndMintsFromWallet(user);

  // return arweave data
  res.status(200).json({ diamondMints });
}
