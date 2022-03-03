import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { Serpent } from '../../pages/api/types';
import NftImage from './NftImage';
import SerpentDetails from './SerpentDetails';
import store, { UiSerpent } from '../store/store';

const SerpentsGroup = function (props: any) {
  // todo: write type
  const [serpents, setSerpents] = useState<any[]>([]);
  // todo: write type
  const [stakedSerpents, setStakedSerpents] = useState<any[]>([]);
  const [selectedSerpent, setSelectedSerpent] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { connection } = useConnection();
  const { publicKey, wallet } = useWallet();

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

  // get serpents
  useEffect(() => {
    if (publicKey) {
      (async () => {
        setLoading(true);

        const { serpents: allSerpents } = await (
          await fetch(`/api/serpents`)
        ).json();
        const mints = allSerpents.map((item: Serpent) => item.mint);

        const { serpentMints } = await (
          await fetch(`/api/serpents/owned?publicKey=${publicKey.toString()}`)
        ).json();

        // get serpents from user
        setSerpents(
          serpentMints.map((item: any) => {
            // for getting metadata from allSerpents
            const index = mints.indexOf(item.mint);
            const { rank, name, imageUrl } = allSerpents[index];

            return {
              ...item,
              rank,
              name,
              imageUrl,
            };
          })
        );

        const { stakedSerpents: allStakedSerpents } = await (
          await fetch(`/api/serpents/staked?publicKey=${publicKey.toString()}`)
        ).json();

        setStakedSerpents(allStakedSerpents);
        setLoading(false);
      })();
    }
  }, [publicKey, connection, wallet]);

  const toggleSerpent = function (serpent: UiSerpent) {
    store.setState({ pair: null });
    if (serpent.mint === selectedSerpent?.mint) {
      store.setState({ serpent: null });
    } else {
      store.setState({ serpent });
    }
  };

  const sortedSerpents = serpents
    .sort((a, b) => {
      return a.rank > b.rank ? 1 : -1;
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
      return a.rank > b.rank ? 1 : -1;
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
      {loading ? null : (
        <Box
          sx={{
            display: 'flex',
            gap: '8px',
            flex: 1,
            flexWrap: 'wrap',
            // background: '#00000055',
            padding: '8px',
            justifyContent: 'center',
          }}
        >
          {sortedStakedSerpents}
          {sortedSerpents}
        </Box>
      )}
    </Box>
  );
};

export default SerpentsGroup;
