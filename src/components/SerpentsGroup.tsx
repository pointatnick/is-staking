import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { Serpent } from '../../pages/api/types';
import NftImage from './NftImage';
import SerpentDetails from './SerpentDetails';
import store, { UiSerpent } from '../store/store';

type Props = {
  serpents: Serpent[];
};

const SerpentsGroup = function ({ serpents }: Props) {
  // todo: write type
  const [unstakedSerpents, setUnstakedSerpents] = useState<Serpent[]>([]);
  const [stakedSerpents, setStakedSerpents] = useState<Serpent[]>([]);
  const [selectedSerpent, setSelectedSerpent] = useState<any>({});

  // set selected serpent
  useEffect(() => {
    const removeListener = store.addListener((state: any) => {
      const { serpent } = state;
      setSelectedSerpent(serpent);
    });
    const { serpent } = store.getState();
    setSelectedSerpent(serpent);

    return () => {
      removeListener();
    };
  }, [selectedSerpent, setSelectedSerpent]);

  // set selected serpent
  useEffect(() => {
    setUnstakedSerpents(serpents.filter((serpent) => !serpent.isStaked));
    setStakedSerpents(
      serpents.filter((serpent) => serpent.isStaked && !serpent.isPaired)
    );
  }, [serpents]);

  const toggleSerpent = function (serpent: UiSerpent) {
    store.setState({ pair: null });
    if (serpent.mint === selectedSerpent?.mint) {
      store.setState({ serpent: null });
    } else {
      store.setState({ serpent });
    }
  };

  const sortedSerpents = unstakedSerpents
    .sort((a, b) => {
      return a.icePerDay < b.icePerDay ? 1 : -1;
    })
    .map((serpent: UiSerpent) => (
      <Box
        key={serpent.mint}
        onClick={() => toggleSerpent(serpent)}
        sx={{
          backgroundColor:
            serpent.mint === selectedSerpent?.mint ? 'gold' : 'secondary.main',
          color: 'secondary.dark',
          display: 'flex',
          flexDirection: 'column',
          height: '156.77px',
        }}
      >
        <NftImage image={serpent.imageUrl} />
        <SerpentDetails name={serpent.name} rank={serpent.rank} />
      </Box>
    ));

  const sortedStakedSerpents = stakedSerpents
    .sort((a, b) => {
      return a.icePerDay < b.icePerDay ? 1 : -1;
    })
    .map((serpent: UiSerpent) => (
      <Box
        key={serpent.mint}
        onClick={() => toggleSerpent(serpent)}
        sx={{
          backgroundColor:
            serpent.mint === selectedSerpent?.mint ? 'gold' : 'secondary.main',
          color: 'secondary.dark',
          display: 'flex',
          flexDirection: 'column',
          height: '156.77px',
        }}
      >
        <NftImage image={serpent.imageUrl} />
        <SerpentDetails
          name={serpent.name}
          rank={serpent.rank}
          staked={serpent.isStaked}
        />
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
        SERPENTS
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          // background: '#00000055',
          padding: '8px',
          justifyContent: 'center',
        }}
      >
        {sortedStakedSerpents}
        {sortedSerpents}
      </Box>
    </Box>
  );
};

export default SerpentsGroup;
