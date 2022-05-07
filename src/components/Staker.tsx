import styles from '../../styles/Staker.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import Box from '@mui/material/Box';
import SerpentsGroup from './SerpentsGroup';
import DiamondsGroup from './DiamondsGroup';
import PairsGroup from './PairsGroup';
import { Diamond, PairedSerpent, Serpent } from '../../pages/api/types';

type Props = {
  serpents: Serpent[];
  diamonds: Diamond[];
  pairedSerpents: PairedSerpent[];
};

export default function Staker({ serpents, diamonds, pairedSerpents }: Props) {
  const { publicKey } = useWallet();
  return (
    <Box component="main" className={styles.main}>
      {publicKey ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '64px',
            margin: ['0', '0 4em', '0 4em', '0 8em', '0 16em'],
            paddingBottom: '40px',
          }}
        >
          <PairsGroup pairedSerpents={pairedSerpents} />
          <Box
            sx={{
              display: 'flex',
              gap: '64px',
              flexDirection: ['column', 'column', 'row', 'row', 'row'],
            }}
          >
            <SerpentsGroup serpents={serpents} />
            <DiamondsGroup diamonds={diamonds} />
          </Box>
        </Box>
      ) : (
        <div className={styles.infoText}>Please connect your wallet</div>
      )}
    </Box>
  );
}
