import Box from '@mui/material/Box';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { Diamond } from '../../pages/api/types';
import DiamondDetails from './DiamondDetails';
import NftImage from './NftImage';
import store, { UiDiamond } from '../store/store';
import { Typography } from '@mui/material';

type Props = {
  diamonds: Diamond[];
};

const DiamondsGroup = function ({ diamonds }: Props) {
  const [unstakedDiamonds, setUnstakedDiamonds] = useState<Diamond[]>([]);
  const [stakedDiamonds, setStakedDiamonds] = useState<Diamond[]>([]);
  // todo: write type
  const [selectedDiamond, setSelectedDiamond] = useState<any>({});

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

  useEffect(() => {
    setUnstakedDiamonds(diamonds.filter((diamond) => !diamond.isStaked));
    setStakedDiamonds(
      diamonds.filter((diamond) => diamond.isStaked && !diamond.isPaired)
    );
  }, [diamonds]);

  const toggleDiamond = function (diamond: UiDiamond) {
    store.setState({ pair: null });
    if (diamond.mint === selectedDiamond?.mint) {
      store.setState({ diamond: null });
    } else {
      store.setState({ diamond });
    }
  };

  const sortedDiamonds = unstakedDiamonds
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
    </Box>
  );
};

export default DiamondsGroup;
