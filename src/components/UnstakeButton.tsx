import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Message, PublicKey, Transaction } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useCallback, useState } from 'react';
import { DAO_PUBLIC_KEY } from '../config';
import LoadingProgress from './LoadingProgress';
import bs58 from 'bs58';

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

      const nftFromTokenAccount =
        await mintToken.getOrCreateAssociatedAccountInfo(DAO_PUBLIC_KEY);

      const response = await (
        await fetch('/api/staking/createUnstakeTransaction', {
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
      const transaction = Transaction.populate(Message.from(txMessage.data), [
        bs58.encode(daoSignature.data),
      ]);

      try {
        // prompt wallet to sign
        //@ts-ignore
        const tx = await signTransaction(transaction);
        const txMessage = tx.serializeMessage();
        const signature = tx.signatures.filter(
          (s) => s.publicKey.toBase58() === publicKey.toBase58()
        )[0].signature;

        // claim ICE
        // TODO: reflect this somewhere
        const { error: claimError } = await (
          await fetch('/api/staking/unstake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              txMessage,
              signature,
              mint: props.mint,
            }),
          })
        ).json();

        // reload the page to reflect changes
        if (!claimError) {
          location.reload();
        }
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

  return (
    <Box sx={{ width: '100%' }}>
      {loading ? (
        <LoadingProgress />
      ) : (
        <Box sx={{ width: '100%' }}>
          <Button
            fullWidth
            sx={{ display: 'block', backgroundColor: 'secondary.main' }}
            onClick={onUnstake}
          >
            Unstake
          </Button>
        </Box>
      )}
    </Box>
  );
}
