import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import StakeCounter from './StakeCounter';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';
import IceCounter from './IceCounter';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

type Props = {
  ice: number;
};

export default function HeroLayout({ ice }: Props) {
  const [totalSerpentsStaked, setTotalSerpentsStaked] = useState(0);
  const [totalDiamondsStaked, setTotalDiamondsStaked] = useState(0);

  // get total serpents staked
  useEffect(() => {
    (async () => {
      const { stakedSerpents } = await (
        await fetch(`/api/serpents/totalStaked`)
      ).json();
      const { stakedDiamonds } = await (
        await fetch(`/api/diamonds/totalStaked`)
      ).json();
      setTotalSerpentsStaked(stakedSerpents.length);
      setTotalDiamondsStaked(stakedDiamonds.length);
    })();
  }, []);

  return (
    <Box component="header" sx={{ pt: 4 }}>
      <Grid container direction="column" alignItems="center">
        <Typography
          sx={{
            marginTop: '8px',
            fontSize: '3.3rem',
            fontFamily: 'Metamorphous',
          }}
          maxWidth="xl"
          variant="h3"
          align="center"
          color="white"
          gutterBottom
        >
          THE SERPENT LAIR ♦ THE DIAMOND VAULT
        </Typography>
        <Stack
          sx={{ padding: '16px 0 0 0' }}
          direction="column"
          spacing={2}
          alignItems="center"
        >
          <Box sx={{ display: 'flex', maxWidth: '550px', gap: '1em' }}>
            <Typography
              sx={{
                textAlign: 'center',
                fontFamily: 'Cormorant Garamond',
                fontSize: '1.2em',
              }}
              color="white"
              gutterBottom
            >
              Stake your NFTs for $ICE. The rarer your NFT, the higher your
              yield. Pair your serpent and diamond together for a bonus yield.
            </Typography>
            <WalletMultiButton />
          </Box>
        </Stack>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '60px',
            justifyContent: 'center',
          }}
        >
          <Box>
            <StakeCounter
              stakedCount={totalSerpentsStaked}
              totalSupply={3333}
              nft="serpents"
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <IceCounter ice={ice} />
          </Box>
          <Box>
            <StakeCounter
              stakedCount={totalDiamondsStaked}
              totalSupply={777}
              nft="diamonds"
            />
          </Box>
        </Box>
      </Grid>
    </Box>
  );
}
