import { PublicKey } from '@solana/web3.js';
import { connection, DAO_PUBLIC_KEY } from '../../../src/config';

export default async function handler(req, res) {
  // const diamonds = await getDiamondsFromWallet(DAO_PUBLIC_KEY);
  // // get most recent signature of diamonds in DAO
  // const signatures = await Promise.all(
  //   diamonds.map(async (mint) => {
  //     // get most recent signature
  //     return (await connection.getSignaturesForAddress(new PublicKey(mint)))[0]
  //       .signature;
  //   })
  // );
  // // get mints that are staked that belong to the connected wallet
  // const stakedMints = await Promise.all(
  //   signatures.map(async (signature) => {
  //     const tx = await connection.getConfirmedTransaction(
  //       signature,
  //       'confirmed'
  //     );
  //     return tx.transaction.feePayer.toString();
  //   })
  // );
  // res.status(200).json(stakedMints);
}
