import Box from '@mui/material/Box';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { Diamond } from '../../pages/api/types';
import { DAO_PUBLIC_KEY } from '../config';
import DiamondDetails from './DiamondDetails';
import NftImage from './NftImage';
import store, { UiDiamond } from '../store/store';
import { Typography } from '@mui/material';

const DiamondsGroup = function (props: any) {
  // todo: write type
  const [diamonds, setDiamonds] = useState<any[]>([]);
  // todo: write type
  const [stakedDiamonds, setStakedDiamonds] = useState<any[]>([]);
  const [selectedDiamond, setSelectedDiamond] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { connection } = useConnection();
  const { publicKey, wallet } = useWallet();

  // set selected diamond
  useEffect(() => {
    const removeListener = store.addListener((state: any) => {
      const { diamond } = state;
      setSelectedDiamond(diamond);
    });
    const { diamond } = store.getState();
    setSelectedDiamond(diamond);

    return () => {
      removeListener();
    };
  }, [selectedDiamond, setSelectedDiamond]);

  // get diamonds
  useEffect(() => {
    if (publicKey) {
      (async () => {
        setLoading(true);

        const { diamonds: allDiamonds } = await (
          await fetch(`/api/diamonds`)
        ).json();
        const mints = allDiamonds.map((item: Diamond) => item.mint);

        const { diamondMints } = await (
          await fetch(`/api/diamonds/owned?publicKey=${publicKey.toString()}`)
        ).json();

        // get serpents from user
        setDiamonds(
          diamondMints.map((item: any) => {
            // for getting metadata from allSerpents
            const index = mints.indexOf(item.mint);
            const { rank, name, imageUrl } = allDiamonds[index];

            return {
              ...item,
              rank,
              name,
              imageUrl,
            };
          })
        );

        const { stakedDiamondMints, stakedDiamonds: allStakedDiamonds } =
          await (
            await fetch(
              `/api/diamonds/staked?publicKey=${publicKey.toString()}`
            )
          ).json();
        const stakedMintsForUser: any[] = [];

        await Promise.all(
          stakedDiamondMints.map(async (item: any) => {
            // for getting metadata from rarityResponse
            const index = mints.indexOf(item.mint);
            const tokenAta = new PublicKey(item.tokenAccount);

            try {
              // get most recent signature for ATA
              const signature = (
                await connection.getSignaturesForAddress(tokenAta)
              )[0].signature;
              // get tx data
              const tx = await connection.getConfirmedTransaction(
                signature,
                'confirmed'
              );

              // determine if diamond ended up with DAO in most recent ATA transaction
              if (tx?.meta?.postTokenBalances) {
                for (const balance of tx.meta.postTokenBalances) {
                  if (
                    balance.owner === DAO_PUBLIC_KEY.toString() &&
                    balance.uiTokenAmount.uiAmount === 1
                  ) {
                    // found a diamond in the DAO from this ATA
                    // get metadata
                    const {
                      rank,
                      name,
                      imageUrl,
                      lastStaked,
                      isStaked,
                      iceToCollect,
                    } = allDiamonds[index];
                    stakedMintsForUser.push({
                      ...item,
                      rank,
                      name,
                      imageUrl,
                      lastStaked,
                      isStaked,
                      iceToCollect,
                    });
                    break;
                  }
                }
              }
            } catch (err) {
              console.error(item.mint, err);
            }
          })
        );

        setStakedDiamonds(stakedMintsForUser);
        setLoading(false);
      })();
    }
  }, [publicKey, connection, wallet]);

  const sortedDiamonds = diamonds
    .sort((a, b) => {
      return a.rank > b.rank ? 1 : -1;
    })
    .map((diamond) => (
      <Box
        key={diamond.mint}
        onClick={() => toggleDiamond(diamond)}
        sx={{
          backgroundColor:
            diamond.mint === selectedDiamond?.mint ? 'gold' : 'secondary.main',
          color: 'secondary.dark',
          display: 'flex',
          flexDirection: 'column',
          height: '156.77px',
        }}
      >
        <NftImage image={diamond.imageUrl} />
        <Box sx={{ flex: 1 }}>
          <DiamondDetails name={diamond.name} rank={diamond.rank} />
        </Box>
      </Box>
    ));

  const toggleDiamond = function (diamond: UiDiamond) {
    if (diamond.mint === selectedDiamond?.mint) {
      store.setState({ diamond: null });
    } else {
      store.setState({ diamond });
    }
  };

  const sortedStakedDiamonds = stakedDiamonds
    .sort((a, b) => {
      return a.rank > b.rank ? 1 : -1;
    })
    .map((diamond: UiDiamond) => (
      <Box
        key={diamond.mint}
        onClick={() => toggleDiamond(diamond)}
        sx={{
          backgroundColor:
            diamond.mint === selectedDiamond?.mint ? 'gold' : 'secondary.main',
          color: 'secondary.dark',
          display: 'flex',
          flexDirection: 'column',
          height: '156.77px',
        }}
      >
        <NftImage image={diamond.imageUrl} />
        <Box sx={{ flex: 1 }}>
          <DiamondDetails
            name={diamond.name}
            rank={diamond.rank}
            staked={diamond.isStaked}
          />
        </Box>
      </Box>
    ));

  return (
    <Box
      sx={{
        flex: 1,
        padding: '8px',
      }}
    >
      <Typography
        sx={{ fontFamily: 'Metamorphous', color: 'white', textAlign: 'center' }}
        variant="h4"
      >
        DIAMONDS
      </Typography>
      {loading ? null : (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            // background: '#00000055',
          }}
        >
          {sortedStakedDiamonds}
          {sortedDiamonds}
        </Box>
      )}
    </Box>
  );
};

export default DiamondsGroup;
