import { PublicKey } from '@solana/web3.js';
import { CONNECTION, DAO_PUBLIC_KEY } from '../../../src/config';
import { getSerpentsFromWallet } from '../serpents/[publicKey]';

export default async function handler(req, res) {
  const serpents = await getSerpentsFromWallet(DAO_PUBLIC_KEY);
  // get most recent signature of diamonds in DAO
  const signatures = await Promise.all(
    serpents.map(async (mint) => {
      // get most recent signature
      return (await CONNECTION.getSignaturesForAddress(new PublicKey(mint)))[0]
        .signature;
    })
  );
  // get mints that are staked that belong to the connected wallet
  const stakedMints = await Promise.all(
    signatures.map(async (signature) => {
      const tx = await CONNECTION.getConfirmedTransaction(
        signature,
        'confirmed'
      );
      return tx.transaction.feePayer.toString();
    })
  );
  res.status(200).json(stakedMints);
}
