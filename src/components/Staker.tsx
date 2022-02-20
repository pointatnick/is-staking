import styles from '../../styles/Staker.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import Box from '@mui/material/Box';
import SerpentsGroup from './SerpentsGroup';
import DiamondsGroup from './DiamondsGroup';
import Button from '@mui/material/Button';
import store from '../store/store';
import { useEffect, useState } from 'react';

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
  const [selectedSerpent, setSelectedSerpent] = useState<any>({});
  const [selectedDiamond, setSelectedDiamond] = useState<any>({});
  // set selected diamond
  useEffect(() => {
    const removeListener = store.addListener((state: any) => {
      const { serpent, diamond } = state;
      setSelectedSerpent(serpent);
      setSelectedDiamond(diamond);
    });
    const { serpent, diamond } = store.getState();
    setSelectedSerpent(serpent);
    setSelectedDiamond(diamond);

    return () => {
      removeListener();
    };
  }, []);

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

  const stakeBtnShouldBeDisabled = function () {
    if (selectedDiamond && selectedSerpent) {
      return true;
    }

    if (selectedDiamond) {
      return selectedDiamond.isStaked;
    } else if (selectedSerpent) {
      return selectedSerpent.isStaked;
    }

    return true;
  };

  const unstakeBtnShouldBeDisabled = function () {
    if (selectedDiamond && selectedSerpent) {
      return true;
    }

    if (selectedDiamond) {
      return !selectedDiamond.isStaked;
    } else if (selectedSerpent) {
      return !selectedSerpent.isStaked;
    }

    return true;
  };

  const pairBtnShouldBeDisabled = !(
    // only enable paired button if both NFTs are staked
    (selectedDiamond?.isStaked && selectedSerpent?.isStaked)
  );

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
        disabled={stakeBtnShouldBeDisabled()}
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
        disabled={unstakeBtnShouldBeDisabled()}
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
        disabled={pairBtnShouldBeDisabled}
      >
        Pair
      </Button>
    </Box>
  );
}

// function StakeButton(props: any) {
//   const { selectedDiamond, selectedSerpent } = props;
//   const disabled = function () {
//     if (selectedDiamond && selectedSerpent) {
//       return true;
//     }

//     if (selectedDiamond) {
//       return selectedDiamond.isStaked;
//     } else if (selectedSerpent) {
//       return selectedSerpent.isStaked;
//     }

//     return true;
//   };

//   const stakeNft = function () {
//     // todo
//     console.log('staking');
//   };

//   useEffect(() => {
//     if (selectedDiamond && selectedSerpent) {
//       setDisabled(true);
//     }

//     if (selectedDiamond) {
//       setDisabled(selectedDiamond.isStaked);
//     } else if (selectedSerpent) {
//       setDisabled(selectedSerpent.isStaked);
//     }

//     setDisabled(true);
//   }, [selectedDiamond, selectedSerpent]);

//   return (
//     <Button
//       variant="contained"
//       sx={{
//         flex: '1',
//         ':disabled': {
//           color: '#ffffff55',
//           backgroundColor: '#39322655',
//         },
//       }}
//       onClick={stakeNft}
//       disabled={disabled}
//     >
//       Stake
//     </Button>
//   );
// }
