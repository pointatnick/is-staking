import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { PublicKey, Transaction } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { useCallback, useState } from 'react';
import { DAO_PUBLIC_KEY } from '../config';
import LoadingProgress from './LoadingProgress';

export default function StakeButton(props: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const handleClick = useCallback(() => {
    setLoading(true);
    (async () => {
      if (publicKey) {
        // Stake the diamond
        const mint = new PublicKey(props.mint);

        try {
          const instructions = [];
          const toTokenAddress = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mint,
            DAO_PUBLIC_KEY
          );

          // Check if destination associated token account exists
          const toTokenAccount = await connection.getAccountInfo(
            toTokenAddress
          );
          if (toTokenAccount === null) {
            instructions.push(
              Token.createAssociatedTokenAccountInstruction(
                ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                mint,
                toTokenAddress,
                DAO_PUBLIC_KEY,
                publicKey
              )
            );
          }

          instructions.push(
            Token.createTransferInstruction(
              TOKEN_PROGRAM_ID,
              new PublicKey(props.tokenAccount),
              toTokenAddress,
              publicKey,
              [],
              1
            )
          );

          // create and sign transaction, broadcast, and confirm
          const transaction = new Transaction().add(...instructions);
          transaction.feePayer = publicKey;
          transaction.recentBlockhash = (
            await connection.getRecentBlockhash()
          ).blockhash;

          //@ts-ignore
          const signedTx = await signTransaction(transaction);
          const txMessage = signedTx.serializeMessage();
          const { signature } = signedTx.signatures.filter(
            (s) => s.publicKey.toBase58() === publicKey.toBase58()
          )[0];

          const { success } = await (
            await fetch('/api/staking/stake', {
              method: 'post',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                publicKey: publicKey.toBase58(),
                signature,
                txMessage,
                mint: props.mint,
              }),
            })
          ).json();

          if (success) {
            // TODO: set success instead
            setLoading(false);
            location.reload();
          } else {
            setLoading(false);
            setError(true);
          }
        } catch (err) {
          setLoading(false);
          console.error(err);
        }
      }
    })();
  }, [publicKey, connection, signTransaction, props.mint, props.tokenAccount]);

  return (
    <Box sx={{ width: '100%' }}>
      {loading ? (
        <LoadingProgress />
      ) : (
        <Button
          fullWidth
          sx={{ display: 'block', backgroundColor: 'secondary.main' }}
          onClick={handleClick}
        >
          Stake
        </Button>
      )}
    </Box>
  );
}
