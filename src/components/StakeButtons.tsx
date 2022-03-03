import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Message, PublicKey, Transaction } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';
import { DAO_PUBLIC_KEY } from '../config';
import store from '../store/store';

export default function StakeButtons(props: any) {
  const [selectedSerpent, setSelectedSerpent] = useState<any>({});
  const [selectedDiamond, setSelectedDiamond] = useState<any>({});
  const [selectedPair, setSelectedPair] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { publicKey, signTransaction, wallet } = useWallet();
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

  const stakeNft = useCallback(() => {
    setLoading(true);
    (async () => {
      if (publicKey) {
        let selectedNft = selectedDiamond ? selectedDiamond : selectedSerpent;

        // Stake the diamond
        const mint = new PublicKey(selectedNft.mint);

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
              new PublicKey(selectedNft.tokenAccount),
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
          console.log(signedTx);
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
        console.log(selectedNft);

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

        const response = await (
          await fetch('/api/staking/createUnstakeTransaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              publicKey: publicKey.toBase58(),
              mint: selectedNft.mint,
              nftFromTokenAddress: nftFromTokenAccount.address.toString(),
              nftToTokenAddress: selectedNft.tokenAccount,
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
                publicKey: publicKey.toBase58(),
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
    wallet,
  ]);

  const pairSerpent = function () {
    // todo
    console.log('pairing serpent', 'with diamond');
  };

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
      return !selectedDiamond.isStaked;
    } else if (selectedSerpent) {
      return !selectedSerpent.isStaked;
    }

    return true;
  };

  const pairBtnShouldBeDisabled = !(
    // only enable paired button if both NFTs are staked
    (selectedDiamond?.isStaked && selectedSerpent?.isStaked)
  );

  // todo;
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
        disabled={pairBtnShouldBeDisabled || loading}
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
        onClick={pairSerpent}
        disabled={unpairBtnShouldBeDisabled || loading}
      >
        Unpair
      </Button>
      <Box sx={{ flex: '2' }} />
    </Box>
  );
}
