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
import { DAO_PUBLIC_KEY, ICE_TOKEN_MINT } from '../config';
import store from '../store/store';

export default function StakeButtons(props: any) {
  const [selectedSerpent, setSelectedSerpent] = useState<any>({});
  const [selectedDiamond, setSelectedDiamond] = useState<Diamond | null>(null);
  const [rechargeSuccessOpen, setRechargeSuccessOpen] =
    useState<boolean>(false);
  const [selectedPair, setSelectedPair] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { publicKey, signTransaction, wallet, sendTransaction } = useWallet();
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
        const mint = new PublicKey(selectedDiamond.mint);
        const rechargeCost =
          selectedDiamond.rank <= 25 && selectedDiamond.isUsedForTierOneMolt
            ? IceRechargePrice.Expensive
            : IceRechargePrice.Cheap;

        try {
          const instructions = [];
          const fromTokenAddress = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            ICE_TOKEN_MINT,
            publicKey
          );
          const toTokenAddress = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            ICE_TOKEN_MINT,
            DAO_PUBLIC_KEY
          );
          instructions.push(
            Token.createTransferCheckedInstruction(
              TOKEN_PROGRAM_ID,
              fromTokenAddress,
              ICE_TOKEN_MINT,
              toTokenAddress,
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
            }, 2000);
          } else {
            setLoading(false);
          }
        } catch (err) {
          setLoading(false);
          console.error(err);
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
          const fromTokenAddress = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mint,
            publicKey
          );
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
              fromTokenAddress,
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
                staker: publicKey.toBase58(),
                signature,
                txMessage,
                mint: selectedNft.mint,
              }),
            })
          ).json();

          if (success) {
            // TODO: set success instead
            setLoading(false);
            location.reload();
          } else {
            setLoading(false);
          }
        } catch (err) {
          setLoading(false);
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

        // Unstake the diamond
        const mintToken = new Token(
          connection,
          new PublicKey(selectedNft.mint),
          TOKEN_PROGRAM_ID,
          //@ts-ignore
          wallet
        );

        const nftFromTokenAccount =
          await mintToken.getOrCreateAssociatedAccountInfo(DAO_PUBLIC_KEY);
        let ata: PublicKey;
        try {
          ata = (
            await connection.getParsedTokenAccountsByOwner(publicKey, {
              mint: new PublicKey(selectedNft.mint),
            })
          ).value[0].pubkey;
        } catch (error) {
          console.error('token account does not exist, creating one');
          ata = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            ICE_TOKEN_MINT,
            publicKey
          );
          const newAtaTx = new Transaction().add(
            Token.createAssociatedTokenAccountInstruction(
              ASSOCIATED_TOKEN_PROGRAM_ID,
              TOKEN_PROGRAM_ID,
              ICE_TOKEN_MINT,
              ata,
              publicKey,
              publicKey
            )
          );
          await sendTransaction(newAtaTx, connection);
        }

        const response = await (
          await fetch('/api/staking/createUnstakeTransaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              publicKey: publicKey.toBase58(),
              mint: selectedNft.mint,
              nftFromTokenAddress: nftFromTokenAccount.address.toString(),
              nftToTokenAddress: ata.toBase58(),
            }),
          })
        ).json();

        const { txMessage, daoSignature } = response;

        // slap signature back on
        const transaction = Transaction.from(txMessage.data);

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
                mint: selectedNft.mint,
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
    })();
  }, [
    publicKey,
    connection,
    selectedDiamond,
    selectedSerpent,
    signTransaction,
    sendTransaction,
    wallet,
  ]);

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

        setLoading(false);

        // todo: error handling
        if (success) {
          location.reload();
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
                fromTokenAccount.address,
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
              await fetch('/api/staking/withdraw', {
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
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [publicKey, selectedPair, connection, signTransaction, wallet]);

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
        Stake
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
        Unstake
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
        Pair
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
        Unpair
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
        >
          Recharge
        </Button>
      ) : null}
      <Box sx={{ flex: '2' }} />
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={rechargeSuccessOpen}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert variant="filled" severity="success" sx={{ width: '100%' }}>
          Recharge has been queued, please check in a few minutes!
        </Alert>
      </Snackbar>
    </Box>
  );
}
