import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Message, PublicKey, Transaction } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { useCallback, useState } from 'react';
import { DAO_PUBLIC_KEY, ICE_TOKEN_MINT } from '../config';
import LoadingProgress from './LoadingProgress';

export default function UnstakeButton(props: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { connection } = useConnection();
  const { publicKey, signTransaction, wallet } = useWallet();

  const onUnstake = useCallback(async () => {
    setLoading(true);
    if (publicKey) {
      // Unstake the diamond
      const mintToken = new Token(
        connection,
        new PublicKey(props.mint),
        TOKEN_PROGRAM_ID,
        //@ts-ignore
        wallet
      );

      // Create associated token accounts for my token if they don't exist yet
      const nftFromTokenAccount =
        await mintToken.getOrCreateAssociatedAccountInfo(DAO_PUBLIC_KEY);

      const response = await (
        await fetch('/api/staking/unstake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            publicKey: publicKey.toBase58(),
            mint: props.mint,
            nftFromTokenAddress: nftFromTokenAccount.address.toString(),
            nftToTokenAddress: props.tokenAccount,
          }),
        })
      ).json();

      const { txMessage, daoSignature } = response;

      // slap signature back on
      const transaction = Transaction.populate(Message.from(txMessage.data));
      transaction.addSignature(DAO_PUBLIC_KEY, daoSignature.data);

      try {
        // prompt wallet to sign
        //@ts-ignore
        await signTransaction(transaction);
        const serial = transaction.serialize({
          verifySignatures: false,
          requireAllSignatures: false,
        });
        const tx = await connection.sendRawTransaction(serial);
        await connection.confirmTransaction(tx, 'confirmed');
        // mark ice as withdrawn
        await fetch('/api/ice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            publicKey: publicKey.toString(),
            mint: props.mint,
            nftToTokenAddress: props.tokenAccount,
          }),
        });

        // reload the page to reflect changes
        location.reload();
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
  }, [
    publicKey,
    connection,
    props.mint,
    props.tokenAccount,
    signTransaction,
    wallet,
  ]);

  const onClaim = useCallback(async () => {
    setLoading(true);
    if (publicKey) {
      try {
        const mintToken = new Token(
          connection,
          ICE_TOKEN_MINT,
          TOKEN_PROGRAM_ID,
          //@ts-ignore
          wallet
        );

        // create associated token accounts for my token if they don't exist yet
        // owner might never have had ICE before
        const fromTokenAccount =
          await mintToken.getOrCreateAssociatedAccountInfo(DAO_PUBLIC_KEY);
        const toTokenAddress = await Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          ICE_TOKEN_MINT,
          publicKey
        );

        const toTokenAccount = await connection.getAccountInfo(toTokenAddress);

        const instructions = [];
        if (toTokenAccount === null) {
          // if destination associated token account doesn't exist, make one
          instructions.push(
            Token.createAssociatedTokenAccountInstruction(
              ASSOCIATED_TOKEN_PROGRAM_ID,
              TOKEN_PROGRAM_ID,
              ICE_TOKEN_MINT,
              toTokenAddress,
              publicKey,
              publicKey
            )
          );
        }

        // get ICE data
        const { ice } = await (await fetch(`/api/ice/${props.mint}`)).json();

        instructions.push(
          Token.createTransferCheckedInstruction(
            TOKEN_PROGRAM_ID,
            fromTokenAccount.address,
            ICE_TOKEN_MINT,
            toTokenAddress,
            DAO_PUBLIC_KEY,
            [],
            ice * 1e9,
            9
          )
        );

        // create and sign transaction, serialize and send for user to sign
        const transaction = new Transaction().add(...instructions);
        // requires user to sign
        transaction.feePayer = publicKey;
        transaction.recentBlockhash = (
          await connection.getRecentBlockhash()
        ).blockhash;

        //@ts-ignore
        const tx = await signTransaction(transaction);
        const txMessage = tx.serializeMessage();
        const signature = tx.signatures.filter(
          (s) => s.publicKey.toBase58() === publicKey.toBase58()
        )[0].signature;

        // claim ICE
        // TODO: reflect this somewhere
        const { claimError } = await (
          await fetch('/api/staking/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              txMessage,
              signature,
              publicKey: publicKey.toBase58(),
              mint: props.mint,
            }),
          })
        ).json();

        if (!claimError) {
          location.reload();
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  }, [publicKey, connection, props.mint, props.tokenAccount, signTransaction]);

  return (
    <Box sx={{ width: '100%' }}>
      {loading ? (
        <LoadingProgress />
      ) : (
        <Box sx={{ width: '100%', display: 'flex' }}>
          <Button
            fullWidth
            sx={{
              display: 'block',
              margin: '0 auto',
              padding: '1em 0',
            }}
            onClick={onClaim}
          >
            Claim $ICE
          </Button>
          <Button
            fullWidth
            sx={{
              display: 'block',
              margin: '0 auto',
              padding: '1em 0',
            }}
            onClick={onUnstake}
          >
            Unstake
          </Button>
        </Box>
      )}
    </Box>
  );
}
