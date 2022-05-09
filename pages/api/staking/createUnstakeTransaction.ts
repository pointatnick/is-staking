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
  DAO_ICE_TOKEN_ADDRESS,
  DAO_PUBLIC_KEY,
  ICE_TOKEN_MINT,
} from '../../../src/config';
import { getIce } from '../ice/[mint]';
import { getDiamonds, getSerpents } from '../users/[publicKey]';
import { getAssociatedTokenAddress } from '../../../lib/metaplex';
import nacl from 'tweetnacl';

type CreateUnstakeTransactionRequest = {
  publicKey: string;
  mint: string;
  nftFromTokenAddress: string;
  nftToTokenAddress: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { publicKey, mint, nftFromTokenAddress, nftToTokenAddress } =
    req.body as CreateUnstakeTransactionRequest;

  // verify owner
  const stakedSerpents = await getSerpents({ staker: publicKey, mint });
  const stakedDiamonds = await getDiamonds({ staker: publicKey, mint });
  if (stakedSerpents.length === 0 && stakedDiamonds.length === 0) {
    console.warn(`no mint ${mint} belonging to staker ${publicKey}`);
    return res.status(403).json({ error: 'no mint for that staker' });
  }

  // get ice quantity from database
  const ice = +(await getIce(mint)).toFixed(9);
  const user = new PublicKey(publicKey);
  const fromAta = new PublicKey(nftFromTokenAddress);
  const toAta = new PublicKey(nftToTokenAddress);
  const mintAddress = new PublicKey(mint);
  const daoKeypair = Keypair.fromSecretKey(
    bs58.decode(process.env.DAO_PRIVATE_KEY!)
  );

  try {
    // create associated token accounts for my token if they don't exist yet
    // owner might never have had ICE before
    const iceToTokenAddress = await getAssociatedTokenAddress(
      user,
      ICE_TOKEN_MINT
    );
    const instructions = [];
    const iceToTokenAccount = await CONNECTION.getAccountInfo(
      iceToTokenAddress
    );
    console.log('ice', iceToTokenAccount);
    if (iceToTokenAccount === null) {
      // if destination associated token account doesn't exist, make one
      instructions.push(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          ICE_TOKEN_MINT,
          iceToTokenAddress,
          user,
          DAO_PUBLIC_KEY
        )
      );
    }
    // create NFT account if user closed NFT account
    const nftToTokenAccount = await CONNECTION.getAccountInfo(toAta);
    console.log('to', nftToTokenAccount);
    if (nftToTokenAccount === null) {
      // if destination associated token account doesn't exist, make one
      instructions.push(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          mintAddress,
          toAta,
          user,
          DAO_PUBLIC_KEY
        )
      );
    }
    // send ICE
    instructions.push(
      Token.createTransferCheckedInstruction(
        TOKEN_PROGRAM_ID,
        DAO_ICE_TOKEN_ADDRESS,
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
        fromAta,
        mintAddress,
        toAta,
        DAO_PUBLIC_KEY,
        [],
        1,
        0
      )
    );
    // create and sign transaction, serialize and send for user to sign
    const transaction = new Transaction({
      recentBlockhash: (await CONNECTION.getRecentBlockhash()).blockhash,
      feePayer: user,
    }).add(...instructions);
    // requires user to sign
    transaction.partialSign(daoKeypair);
    const txMessage = transaction
      .serialize({
        requireAllSignatures: false,
      })
      .toString('base64');
    // const txMessage = transaction.serializeMessage();
    // const daoSignature = Buffer.from(
    //   nacl.sign.detached(new Uint8Array(txMessage), daoKeypair.secretKey)
    // );
    // return res.status(200).json({ txMessage, daoSignature });
    return res.status(200).json({ txMessage });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'exception' });
  }
}
