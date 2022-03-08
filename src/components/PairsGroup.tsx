import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import store from '../store/store';
import DiamondDetails from './DiamondDetails';
import NftImage from './NftImage';
import SerpentDetails from './SerpentDetails';

const PairsGroup = function (props: any) {
  // todo: write type
  const [pairedSerpents, setPairedSerpents] = useState<any[]>([]);
  const [selectedPair, setSelectedPair] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { connection } = useConnection();
  const { publicKey, wallet } = useWallet();

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

  // get serpents
  useEffect(() => {
    if (publicKey) {
      (async () => {
        setLoading(true);

        const { pairedSerpents: allPairs } = await (
          await fetch(`/api/pairedSerpents/${publicKey.toBase58()}`)
        ).json();

        setPairedSerpents(allPairs);

        setLoading(false);
      })();
    }
  }, [publicKey, connection, wallet]);

  // todo: type
  const togglePair = function (pair: any) {
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
          <DiamondDetails name={pair.diamondName} rank={pair.diamondRank} />
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
      {loading ? null : (
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
      )}
    </Box>
  );
};

export default PairsGroup;
