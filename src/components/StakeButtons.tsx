import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';
import { Diamond, IceRechargePrice } from '../../pages/api/types';
import {
  DAO_ICE_TOKEN_ADDRESS,
  DAO_PUBLIC_KEY,
  ICE_TOKEN_MINT,
} from '../config';
import store from '../store/store';
import { getAssociatedTokenAddress } from '../../lib/metaplex';
import LoadingProgress from './LoadingProgress';

export default function StakeButtons(props: any) {
  const [selectedSerpent, setSelectedSerpent] = useState<any>({});
  const [selectedDiamond, setSelectedDiamond] = useState<Diamond | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [error, setError] = useState('');
  const [rechargeSuccessOpen, setRechargeSuccessOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  // set store data
  useEffect(() => {
    const removeListener = store.addListener((state: any) => {
      const { serpent, diamond, pair } = state;
      setSelectedSerpent(serpent);
      setSelectedDiamond(diamond);
      setSelectedPair(pair);
    });
    const { serpent, diamond, pair } = store.getState();
    setSelectedSerpent(serpent);
    setSelectedDiamond(diamond);
    setSelectedPair(pair);

    return () => {
      removeListener();
    };
  }, []);

  const handleErrorClose = (event: any, reason: any) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorOpen(false);
  };

  const handleClose = (event: any, reason: any) => {
    if (reason === 'clickaway') {
      return;
    }

    setRechargeSuccessOpen(false);
  };

  const rechargeDiamond = useCallback(() => {
    setLoading(true);
    (async () => {
      if (publicKey && selectedDiamond) {
        // request ICE
        const rechargeCost =
          selectedDiamond.rank <= 25 && selectedDiamond.isUsedForTierOneMolt
            ? IceRechargePrice.Expensive
            : IceRechargePrice.Cheap;

        let tokenAccount = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { mint: ICE_TOKEN_MINT }
        );
        const userIceAmount =
          tokenAccount.value[0].account.data.parsed.info.tokenAmount.uiAmount;
        const hasEnoughIce = userIceAmount >= rechargeCost;
        if (hasEnoughIce) {
          try {
            const instructions = [];
            const fromAta = await getAssociatedTokenAddress(
              publicKey,
              ICE_TOKEN_MINT
            );
            instructions.push(
              Token.createTransferCheckedInstruction(
                TOKEN_PROGRAM_ID,
                fromAta,
                ICE_TOKEN_MINT,
                DAO_ICE_TOKEN_ADDRESS,
                publicKey,
                [],
                rechargeCost * 1e9,
                9
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
              await fetch('/api/diamonds/recharge', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  staker: publicKey.toBase58(),
                  signature,
                  txMessage,
                  mint: selectedDiamond.mint,
                }),
              })
            ).json();

            if (success) {
              setLoading(false);
              setRechargeSuccessOpen(true);
              setTimeout(() => {
                location.reload();
              }, 4000);
            } else {
              setError('Action failed, please try again later');
              setErrorOpen(true);
              setLoading(false);
            }
          } catch (err) {
            setLoading(false);
            setError('Action failed, please try again later');
            setErrorOpen(true);
            console.error(err);
          }
        } else {
          setLoading(false);
          setError('Not enough ICE');
          setErrorOpen(true);
        }
      }
    })();
  }, [connection, publicKey, selectedDiamond, signTransaction]);

  const stakeNft = useCallback(() => {
    setLoading(true);
    (async () => {
      if (publicKey) {
        let selectedNft = selectedDiamond ? selectedDiamond : selectedSerpent;

        // Stake the diamond
        const mint = new PublicKey(selectedNft.mint);

        try {
          const instructions = [];
          const fromAta = await getAssociatedTokenAddress(publicKey, mint);
          const toAta = await getAssociatedTokenAddress(DAO_PUBLIC_KEY, mint);

          // Check if destination associated token account exists
          const toTokenAccount = await connection.getAccountInfo(toAta);
          if (toTokenAccount === null) {
            instructions.push(
              Token.createAssociatedTokenAccountInstruction(
                ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                mint,
                toAta,
                DAO_PUBLIC_KEY,
                publicKey
              )
            );
          }

          instructions.push(
            Token.createTransferInstruction(
              TOKEN_PROGRAM_ID,
              fromAta!,
              toAta,
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
                staker: publicKey.toBase58(),
                signature,
                txMessage,
                mint: selectedNft.mint,
              }),
            })
          ).json();

          if (success) {
            // TODO: set success instead
            location.reload();
          } else {
            setLoading(false);
            setError('Action failed, please try again later');
            setErrorOpen(true);
          }
        } catch (err) {
          setLoading(false);
          setError('Action failed, please try again later');
          setErrorOpen(true);
          console.error(err);
        }
      }
    })();
  }, [
    publicKey,
    connection,
    signTransaction,
    selectedDiamond,
    selectedSerpent,
  ]);

  const unstakeNft = useCallback(() => {
    setLoading(true);
    (async () => {
      if (publicKey) {
        let selectedNft = selectedDiamond ? selectedDiamond : selectedSerpent;
        let selectedNftMint = new PublicKey(selectedNft.mint);

        // Unstake the diamond
        const fromAta = await getAssociatedTokenAddress(
          DAO_PUBLIC_KEY,
          selectedNftMint
        );
        let toAta = await getAssociatedTokenAddress(publicKey, selectedNftMint);
        const response = await (
          await fetch('/api/staking/createUnstakeTransaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              publicKey: publicKey.toBase58(),
              mint: selectedNftMint.toBase58(),
              nftFromTokenAddress: fromAta.toBase58(),
              nftToTokenAddress: toAta.toBase58(),
            }),
          })
        ).json();
        const { txMessage, daoSignature } = response;
        // console.log(daoSignature);
        const transaction = Transaction.from(Buffer.from(txMessage, 'base64'));

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
                mint: selectedNftMint.toBase58(),
              }),
            })
          ).json();
          // reload the page to reflect changes
          if (!claimError) {
            location.reload();
          } else {
            setLoading(false);
            setError('Action failed, please try again later');
            setErrorOpen(true);
          }
        } catch (err) {
          console.error(err);
          setLoading(false);
          setError('Action failed, please try again later');
          setErrorOpen(true);
        }
      }
    })();
  }, [publicKey, selectedDiamond, selectedSerpent, signTransaction]);

  const pairSerpent = useCallback(() => {
    (async () => {
      if (publicKey && selectedDiamond) {
        setLoading(true);

        const { success } = await (
          await fetch('/api/pairedSerpents/pair', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              publicKey: publicKey.toBase58(),
              diamondMint: selectedDiamond.mint,
              serpentMint: selectedSerpent.mint,
            }),
          })
        ).json();

        if (success) {
          location.reload();
        } else {
          setLoading(false);
          setError('Action failed, please try again later');
          setErrorOpen(true);
        }
      }
    })();
  }, [publicKey, selectedDiamond, selectedSerpent]);

  const unpairSerpent = useCallback(() => {
    (async () => {
      if (publicKey) {
        setLoading(true);

        const { iceToCollect } = await (
          await fetch(
            `/api/pairedSerpents/unpair?publicKey=${publicKey.toBase58()}&pairedSerpentMint=${
              selectedPair.mint
            }`
          )
        ).json();

        try {
          if (iceToCollect) {
            // create associated token accounts for my token if they don't exist yet
            // owner might never have had ICE before
            // TODO: REFACTOR
            const toTokenAddress = await getAssociatedTokenAddress(
              publicKey,
              ICE_TOKEN_MINT
            );
            const toTokenAccount = await connection.getAccountInfo(
              toTokenAddress
            );
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
                iceToCollect * 1e9,
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
              await fetch('/api/pairedSerpents/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  txMessage,
                  signature,
                }),
              })
            ).json();
            if (claimError) {
              throw new Error('claim error');
            }
            await fetch('/api/pairedSerpents/unpair', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                publicKey: publicKey.toBase58(),
                pairedSerpentMint: selectedPair.mint,
              }),
            });
            location.reload();
          }
        } catch (error) {
          console.log(error);
          setLoading(false);
          setError('Action failed, please try again later');
          setErrorOpen(true);
        }
      }
    })();
  }, [publicKey, selectedPair, connection, signTransaction]);

  const stakeBtnShouldBeDisabled = function () {
    if (selectedDiamond && selectedSerpent) {
      return true;
    }

    if (selectedDiamond) {
      return selectedDiamond.isStaked;
    } else if (selectedSerpent) {
      return selectedSerpent.isStaked;
    }

    return true;
  };

  const unstakeBtnShouldBeDisabled = function () {
    if (selectedDiamond && selectedSerpent) {
      return true;
    }

    if (selectedDiamond) {
      return selectedDiamond.isPaired || !selectedDiamond.isStaked;
    } else if (selectedSerpent) {
      return selectedSerpent.isPaired || !selectedSerpent.isStaked;
    }

    return true;
  };

  const pairBtnShouldBeDisabled = function () {
    if (selectedDiamond && selectedSerpent) {
      // return false if either are paired
      if (selectedDiamond.isPaired || selectedSerpent.isPaired) {
        return true;
      }

      return !(
        // only enable paired button if both NFTs are staked
        (selectedDiamond?.isStaked && selectedSerpent?.isStaked)
      );
    }

    return true;
  };

  const unpairBtnShouldBeDisabled = selectedPair === null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        display: 'flex',
        gap: '8px',
        width: '100%',
        backgroundColor: 'secondary.dark',
        padding: '8px',
      }}
    >
      <Box sx={{ flex: '2' }} />
      <Button
        variant="contained"
        sx={{
          flex: '1',
          ':disabled': {
            color: '#ffffff55',
            backgroundColor: '#39322655',
          },
        }}
        onClick={stakeNft}
        disabled={stakeBtnShouldBeDisabled() || loading}
      >
        {loading ? <LoadingProgress></LoadingProgress> : 'Stake'}
      </Button>
      <Button
        variant="contained"
        sx={{
          flex: '1',
          ':disabled': {
            color: '#ffffff55',
            backgroundColor: '#39322655',
          },
        }}
        onClick={unstakeNft}
        disabled={unstakeBtnShouldBeDisabled() || loading}
      >
        {loading ? <LoadingProgress></LoadingProgress> : 'Unstake'}
      </Button>
      <Button
        variant="contained"
        sx={{
          flex: '1',
          ':disabled': {
            color: '#ffffff55',
            backgroundColor: '#39322655',
          },
        }}
        onClick={pairSerpent}
        disabled={pairBtnShouldBeDisabled() || loading}
      >
        {loading ? <LoadingProgress></LoadingProgress> : 'Pair'}
      </Button>
      <Button
        variant="contained"
        sx={{
          flex: '1',
          ':disabled': {
            color: '#ffffff55',
            backgroundColor: '#39322655',
          },
        }}
        onClick={unpairSerpent}
        disabled={unpairBtnShouldBeDisabled || loading}
      >
        {loading ? <LoadingProgress></LoadingProgress> : 'Unpair'}
      </Button>
      {!selectedDiamond?.hasEnergy &&
      selectedDiamond?.hasEnergy !== undefined ? (
        <Button
          variant="contained"
          sx={{
            flex: '1',
            ':disabled': {
              color: '#ffffff55',
              backgroundColor: '#39322655',
            },
          }}
          onClick={rechargeDiamond}
          disabled={loading}
        >
          {loading ? <LoadingProgress></LoadingProgress> : 'Recharge'}
        </Button>
      ) : null}
      <Box sx={{ flex: '2' }} />
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={rechargeSuccessOpen}
        onClose={handleClose}
      >
        <Alert variant="filled" severity="success" sx={{ width: '100%' }}>
          Recharge has been queued, please check in a few minutes!
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
  );
}
