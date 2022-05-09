import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { useCallback, useState } from 'react';
import { getAssociatedTokenAddress } from '../../lib/metaplex';
import {
  DAO_ICE_TOKEN_ADDRESS,
  DAO_PUBLIC_KEY,
  ICE_TOKEN_MINT,
} from '../config';
import LoadingProgress from './LoadingProgress';

type Props = {
  ice: number;
};

export default function IceCounter({ ice }: Props) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(0);
  const [errorOpen, setErrorOpen] = useState(false);
  const [error, setError] = useState('');
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const handleErrorClose = (event: any, reason: any) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorOpen(false);
  };

  const onClaim = useCallback(async () => {
    setLoading(true);
    if (publicKey) {
      let { ice: iceToWithdraw } = await (
        await fetch(`/api/users/${publicKey}`)
      ).json();

      // cut down iceToWithdraw to 9 decimals
      iceToWithdraw = +iceToWithdraw.toFixed(9);

      // audit ice collection
      const { userCanWithdraw, auditId, remainingTime } = await (
        await fetch('/api/ice/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            publicKey: publicKey.toBase58(),
            type: 'claimAll',
            ice: iceToWithdraw,
          }),
        })
      ).json();

      if (!userCanWithdraw) {
        setTime(remainingTime);
        setOpen(true);
        setLoading(false);
        return;
      }

      try {
        // create associated token accounts for my token if they don't exist yet
        // owner might never have had ICE before
        const toTokenAddress = await getAssociatedTokenAddress(
          publicKey,
          ICE_TOKEN_MINT
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
        instructions.push(
          Token.createTransferCheckedInstruction(
            TOKEN_PROGRAM_ID,
            DAO_ICE_TOKEN_ADDRESS,
            ICE_TOKEN_MINT,
            toTokenAddress,
            DAO_PUBLIC_KEY,
            [],
            iceToWithdraw * 1e9,
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
        const { error: claimError } = await (
          await fetch('/api/staking/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              txMessage,
              signature,
              publicKey: publicKey.toBase58(),
            }),
          })
        ).json();
        if (claimError) {
          throw new Error('claim error');
        }
        location.reload();
      } catch (error) {
        console.log(error);
        // delete most recent audit entry, otherwise failed attempts will prevent a user from claiming for whole day
        await fetch('/api/ice/audit', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ auditId }),
        });
      } finally {
        setLoading(false);
      }
    }
  }, [publicKey, connection, signTransaction]);

  return publicKey ? (
    <Box>
      <Typography
        sx={{ color: 'white', fontFamily: 'Metamorphous' }}
        variant="h3"
      >
        {ice.toLocaleString()} $ICE
      </Typography>
      <Box
        sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}
      >
        {loading ? (
          <LoadingProgress />
        ) : (
          <Button variant="contained" onClick={onClaim}>
            Claim $ICE
          </Button>
        )}
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={open}
          autoHideDuration={10000}
          onClose={() => setOpen(false)}
        >
          <Alert severity="warning" sx={{ fontSize: '16px' }}>
            Please wait {msToTimeString(time)} before claiming ICE again
          </Alert>
        </Snackbar>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={errorOpen}
          onClose={handleErrorClose}
        >
          <Alert variant="filled" severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  ) : null;
}

const msToTimeString = function (duration: number) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
};
