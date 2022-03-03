import Box from '@mui/material/Box';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { Diamond } from '../../pages/api/types';
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

        const { stakedDiamonds: allStakedDiamonds } = await (
          await fetch(`/api/diamonds/staked?publicKey=${publicKey.toString()}`)
        ).json();
        console.log(allStakedDiamonds);

        setStakedDiamonds(allStakedDiamonds);
        setLoading(false);
      })();
    }
  }, [publicKey, connection, wallet]);

  const toggleDiamond = function (diamond: UiDiamond) {
    store.setState({ pair: null });
    if (diamond.mint === selectedDiamond?.mint) {
      store.setState({ diamond: null });
    } else {
      store.setState({ diamond });
    }
  };

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
            padding: '8px',
            justifyContent: 'center',
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
