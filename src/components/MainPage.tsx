import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Staker from './Staker';
import { theme } from '../../styles/theme';
import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material';
import HeroLayout from './HeroLayout';
import StakeButtons from './StakeButtons';
import { Diamond, PairedSerpent, Serpent } from '../../pages/api/types';

require('@solana/wallet-adapter-react-ui/styles.css');

export default function MainPage() {
  const { publicKey } = useWallet();
  const [ice, setIce] = useState<number>(0);
  const [serpents, setSerpents] = useState<Serpent[]>([]);
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [pairedSerpents, setPairedSerpents] = useState<PairedSerpent[]>([]);

  useEffect(() => {
    if (publicKey) {
      (async () => {
        const result = await (await fetch(`/api/users/${publicKey}`)).json();
        console.log(result);
        setIce(result.ice);
        setSerpents(result.serpents);
        setDiamonds(result.diamonds);
        setPairedSerpents(result.pairedSerpents);
      })();
    }
  }, [publicKey]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          backgroundImage: "url('background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <HeroLayout ice={ice} />
        <Staker
          serpents={serpents}
          diamonds={diamonds}
          pairedSerpents={pairedSerpents}
        />
      </Box>
      <StakeButtons />
    </ThemeProvider>
  );
}

/**
 * HeroLayout
 * - Title
 * - Description
 * - WalletButton
 * - IceCounter
 * - ClaimButton
 * - StakeCounter
 * - StakeCounter
 * Staker
 * - StakeButtons
 *   - StakeButton
 *   - UnstakeButton
 *   - PairButton
 * - PairedSerpentGroup
 *   - Title
 *   - PairedSerpent
 *     - Serpent
 *       - NftImage
 *       - NftDetails
 *     - Diamond
 *       - NftImage
 *       - NftDetails
 * - SerpentGroup
 *   - Title
 *   - Serpent
 *     - NftImage
 *     - NftDetails
 * - DiamondGroup
 *   - Title
 *   - Diamond
 *     - NftImage
 *     - NftDetails
 */
