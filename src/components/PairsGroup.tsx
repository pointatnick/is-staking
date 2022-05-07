import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { PairedSerpent } from '../../pages/api/types';
import store from '../store/store';
import { PairedDiamondDetails } from './DiamondDetails';
import NftImage from './NftImage';
import { SerpentDetails } from './SerpentDetails';

type Props = {
  pairedSerpents: PairedSerpent[];
};

const PairsGroup = function ({ pairedSerpents }: Props) {
  const [selectedPair, setSelectedPair] = useState<any>({});

  // set selected serpent
  useEffect(() => {
    const removeListener = store.addListener((state: any) => {
      const { pair } = state;
      setSelectedPair(pair);
    });
    const { pair } = store.getState();
    setSelectedPair(pair);

    return () => {
      removeListener();
    };
  }, [selectedPair, setSelectedPair]);

  //  type
  const togglePair = function (pair: PairedSerpent) {
    store.setState({ diamond: null, serpent: null });
    if (pair.mint === selectedPair?.mint) {
      store.setState({ pair: null });
    } else {
      store.setState({ pair });
    }
  };

  const sortedPairs = pairedSerpents
    .sort((a, b) => {
      return a.diamondRank > b.diamondRank ? 1 : -1;
    })
    .map((pair: any) => (
      <Box
        key={pair.mint}
        onClick={() => togglePair(pair)}
        sx={{ display: 'flex' }}
      >
        <Box
          sx={{
            backgroundColor:
              pair.mint === selectedPair?.mint ? 'gold' : 'secondary.main',
            color: 'secondary.dark',
            display: 'flex',
            flexDirection: 'column',
            height: '156.77px',
          }}
        >
          <NftImage image={pair.imageUrl} />
          <SerpentDetails name={pair.name} rank={pair.rank} />
        </Box>
        <Box
          sx={{
            backgroundColor:
              pair.mint === selectedPair?.mint ? 'gold' : 'secondary.main',
            color: 'secondary.dark',
            display: 'flex',
            flexDirection: 'column',
            height: '156.77px',
          }}
        >
          <NftImage image={pair.diamondImageUrl} />
          <PairedDiamondDetails
            name={pair.diamondName}
            rank={pair.diamondRank}
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
        PAIRS
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          // background: '#00000055',
          padding: '8px',
          justifyContent: 'center',
        }}
      >
        {sortedPairs}
      </Box>
    </Box>
  );
};

export default PairsGroup;
