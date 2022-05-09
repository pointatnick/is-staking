import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import { Diamond } from '../../pages/api/types';
import {
  ConsumedDiamondDetails,
  DiamondDetails,
  MoltingDiamondDetails,
} from './DiamondDetails';
import NftImage from './NftImage';
import store from '../store/store';
import { Typography } from '@mui/material';
import LockSharpIcon from '@mui/icons-material/LockSharp';
import Battery0BarSharpIcon from '@mui/icons-material/BoltSharp';

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

  const toggleDiamond = function (diamond: Diamond) {
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
          <DiamondDetails diamond={diamond} />
        </Box>
      </Box>
    ));

  const sortedStakedDiamonds = stakedDiamonds
    .sort((a, b) => {
      return a.rank > b.rank ? 1 : -1;
    })
    .map((diamond: Diamond) => {
      if (diamond.isMolting) {
        return (
          <Box
            key={diamond.mint}
            sx={{
              backgroundColor: 'secondary.main',
              color: 'secondary.dark',
              display: 'flex',
              flexDirection: 'column',
              height: '156.77px',
            }}
          >
            <Box
              sx={{
                display: 'block',
                height: '106px',
                width: '106px',
              }}
            >
              <LockSharpIcon
                sx={{
                  height: '100px',
                  width: '100px',
                }}
              />
            </Box>
            <MoltingDiamondDetails diamond={diamond} />
          </Box>
        );
      }

      if (!diamond.hasEnergy && diamond.hasEnergy !== undefined) {
        return (
          <Box
            key={diamond.mint}
            onClick={() => toggleDiamond(diamond)}
            sx={{
              backgroundColor:
                diamond.mint === selectedDiamond?.mint
                  ? 'gold'
                  : 'secondary.main',
              color: 'secondary.dark',
              display: 'flex',
              flexDirection: 'column',
              height: '156.77px',
            }}
          >
            <Box
              sx={{
                display: 'block',
                height: '106px',
                width: '106px',
              }}
            >
              <Battery0BarSharpIcon
                sx={{
                  height: '100px',
                  width: '100px',
                }}
              />
            </Box>
            <ConsumedDiamondDetails diamond={diamond} />
          </Box>
        );
      }
      return (
        <Box
          key={diamond.mint}
          onClick={() => toggleDiamond(diamond)}
          sx={{
            backgroundColor:
              diamond.mint === selectedDiamond?.mint
                ? 'gold'
                : 'secondary.main',
            color: 'secondary.dark',
            display: 'flex',
            flexDirection: 'column',
            height: '156.77px',
          }}
        >
          <NftImage image={diamond.imageUrl} />
          <Box sx={{ flex: 1 }}>
            <DiamondDetails diamond={diamond} />
          </Box>
        </Box>
      );
    });

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
