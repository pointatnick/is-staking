import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import store from '../store/store';

export default function StakeButtons(props: any) {
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
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        display: 'flex',
        gap: '8px',
        width: '100%',
        backgroundColor: 'secondary.dark',
        padding: '8px',
      }}
    >
      <Box sx={{ flex: '2' }} />
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
        Unpair
      </Button>
      <Box sx={{ flex: '2' }} />
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
