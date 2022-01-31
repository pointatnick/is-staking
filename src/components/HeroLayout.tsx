import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import StakeCounter from './StakeCounter';

function CenteredTabs(props: any) {
  const [value, setValue] = useState(0);

  const handleChange = (event: any, newValue: number) => {
    setValue(newValue);
    props.handleChange(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        sx={{
          '& .MuiTabs-indicator': {
            bgcolor: 'white',
          },
        }}
        value={value}
        onChange={handleChange}
        centered
      >
        <Tab
          sx={{
            '&.Mui-selected': {
              color: 'white',
            },
            color: 'secondary.light',
          }}
          disableRipple
          label={`Staked (${props.ownerStaked.length})`}
        />
        <Tab
          sx={{
            '&.Mui-selected': {
              color: 'white',
            },
            color: 'secondary.light',
          }}
          disableRipple
          label="Unstaked"
        />
      </Tabs>
    </Box>
  );
}

export default function HeroLayout(props: any) {
  const { publicKey } = useWallet();

  return (
    <Box component="header" sx={{ pt: 4 }}>
      <Grid container direction="column" alignItems="center">
        <Typography
          sx={{
            marginTop: '60px',
            fontSize: '3.3rem',
            fontFamily: 'Metamorphous',
          }}
          maxWidth="xl"
          variant="h3"
          align="center"
          color="white"
          gutterBottom
        >
          THE SERPENT LAIR
        </Typography>
        <Stack
          sx={{ padding: '16px 0px' }}
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
              Stake your serpents for $ICE. The more rare your serpent, the
              higher your yield.
            </Typography>
            <WalletMultiButton />
          </Box>
          <StakeCounter stakedCount={props.stakedCount} />
        </Stack>
      </Grid>
      {publicKey ? (
        <CenteredTabs
          ownerStaked={props.ownerStaked}
          handleChange={props.handleTabChange}
        />
      ) : null}
    </Box>
  );
}
