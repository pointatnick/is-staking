import styles from '../../styles/Staker.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import Box from '@mui/material/Box';
import SerpentsGroup from './SerpentsGroup';
import DiamondsGroup from './DiamondsGroup';
import Button from '@mui/material/Button';
import store from '../store/store';

export default function Staker() {
  const { publicKey } = useWallet();
  return (
    <Box component="main" className={styles.main}>
      {publicKey ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '64px',
            margin: ['0', '0 4em', '0 4em', '0 8em', '0 24em'],
          }}
        >
          <StakeButtons />
          <Box sx={{ border: '1px solid red' }}>content</Box>
          <Box
            sx={{
              display: 'flex',
              gap: '64px',
              flexDirection: ['column', 'column', 'row', 'row', 'row'],
            }}
          >
            <SerpentsGroup />
            <DiamondsGroup />
          </Box>
        </Box>
      ) : (
        <div className={styles.infoText}>Please connect your wallet</div>
      )}
    </Box>
  );
}

function StakeButtons(props: any) {
  const { serpent, diamond } = store.getState();
  const stakeNft = function () {
    // todo
    console.log('staking');
  };

  const unstakeNft = function () {
    // todo
    console.log('unstaking');
  };

  const pairSerpent = function () {
    // todo
    console.log('pairing serpent', 'with diamond');
  };

  const isSelectedNftStaked = function () {
    return diamond?.isStaked || serpent?.isStaked;
  };

  // ????
  const hasOneNftSelected = function () {
    if (diamond && serpent) {
      // user has selected one of each
      return false;
    } else {
      return diamond || serpent ? true : false;
    }
  };
  const hasNoNftSelected = function () {
    return !diamond && !serpent;
  };

  return (
    <Box sx={{ display: 'flex', gap: '8px' }}>
      <Button
        variant="contained"
        sx={{
          flex: '1',
          ':disabled': {
            color: '#ffffff55',
            backgroundColor: '#39322655',
          },
        }}
        onClick={stakeNft}
        disabled={isSelectedNftStaked() || !hasOneNftSelected()}
      >
        Stake
      </Button>
      <Button
        variant="contained"
        sx={{
          flex: '1',
          ':disabled': {
            color: '#ffffff55',
            backgroundColor: '#39322655',
          },
        }}
        onClick={unstakeNft}
        disabled={!isSelectedNftStaked() || !hasOneNftSelected()}
      >
        Unstake
      </Button>
      <Button
        variant="contained"
        sx={{
          flex: '1',
          ':disabled': {
            color: '#ffffff55',
            backgroundColor: '#39322655',
          },
        }}
        onClick={pairSerpent}
        disabled={!(diamond?.isStaked && serpent?.isStaked)}
      >
        Pair
      </Button>
    </Box>
  );
}
