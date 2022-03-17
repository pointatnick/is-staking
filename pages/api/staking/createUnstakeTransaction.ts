import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import * as bs58 from 'bs58';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import {
  CONNECTION,
  DAO_PUBLIC_KEY,
  ICE_TOKEN_MINT,
} from '../../../src/config';
import { getIce } from '../ice/[mint]';
import { getTokenAccountsAndMintsFromWallet as getSerpentTokenAccountsAndMintsFromWallet } from '../serpents/owned';
import { getTokenAccountsAndMintsFromWallet as getDiamondTokenAccountsAndMintsFromWallet } from '../diamonds/owned';
import { getSerpentsFromWallet } from '../serpents/[publicKey]';
import { getSerpents } from '../serpents';
import { getDiamonds } from '../diamonds';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | {
        txMessage: Buffer;
        daoSignature: Buffer;
      }
    | { error: string }
  >
) {
  const { publicKey, mint, nftFromTokenAddress, nftToTokenAddress } = req.body;
  const user = new PublicKey(publicKey);
  const daoKeypair = Keypair.fromSecretKey(
    bs58.decode(process.env.DAO_PRIVATE_KEY!)
  );

  try {
    // // verify owner
    // const stakedSerpentMints = await getSerpentTokenAccountsAndMintsFromWallet(
    //   user,
    //   0
    // );
    // let item = stakedSerpentMints.filter(
    //   (item: any) => item.tokenAccount === nftToTokenAddress
    // )[0];

    // if (!item) {
    //   const stakedDiamondMints =
    //     await getDiamondTokenAccountsAndMintsFromWallet(user, 0);
    //   item = stakedDiamondMints.filter(
    //     (item: any) => item.tokenAccount === nftToTokenAddress
    //   )[0];
    // }

    const stakedSerpents = await getSerpents({ staker: publicKey, mint });
    const stakedDiamonds = await getDiamonds({ staker: publicKey, mint });
    if (stakedSerpents.length === 0 && stakedDiamonds.length === 0) {
      console.warn(`no mint ${mint} belonging to staker ${publicKey}`);
      res.status(403).json({ error: 'no mint for that staker' });
    } else {
      const iceMint = new Token(
        CONNECTION,
        ICE_TOKEN_MINT,
        TOKEN_PROGRAM_ID,
        daoKeypair
      );
      // create associated token accounts for my token if they don't exist yet
      // owner might never have had ICE before
      const iceFromTokenAccount =
        await iceMint.getOrCreateAssociatedAccountInfo(DAO_PUBLIC_KEY);
      const iceToTokenAddress = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        ICE_TOKEN_MINT,
        user
      );
      const instructions = [];
      const iceToTokenAccount = await CONNECTION.getAccountInfo(
        iceToTokenAddress
      );
      if (iceToTokenAccount === null) {
        // if destination associated token account doesn't exist, make one
        instructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            ICE_TOKEN_MINT,
            iceToTokenAddress,
            user,
            user
          )
        );
      }
      // get ice quantity from database
      const ice = await getIce(mint);
      // send ICE
      instructions.push(
        Token.createTransferCheckedInstruction(
          TOKEN_PROGRAM_ID,
          iceFromTokenAccount.address,
          ICE_TOKEN_MINT,
          iceToTokenAddress,
          DAO_PUBLIC_KEY,
          [],
          ice * 1e9,
          9
        )
      );
      // send NFT
      instructions.push(
        Token.createTransferCheckedInstruction(
          TOKEN_PROGRAM_ID,
          new PublicKey(nftFromTokenAddress),
          new PublicKey(mint),
          new PublicKey(nftToTokenAddress),
          DAO_PUBLIC_KEY,
          [],
          1,
          0
        )
      );
      // create and sign transaction, serialize and send for user to sign
      const transaction = new Transaction().add(...instructions);
      // requires user to sign
      transaction.feePayer = user;
      transaction.recentBlockhash = (
        await CONNECTION.getRecentBlockhash()
      ).blockhash;
      transaction.sign(daoKeypair);
      const txMessage = transaction.serializeMessage();
      const signature = transaction.signatures.filter(
        (s) => s.publicKey.toString() === DAO_PUBLIC_KEY.toString()
      )[0].signature;
      if (signature) {
        res.status(200).json({ txMessage, daoSignature: signature });
      } else {
        res.status(500).json({ error: 'no signature' });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'exception' });
  }
}
