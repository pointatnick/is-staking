import Head from 'next/head';
import { useMemo } from 'react';
import {
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import Staker from '../src/components/Staker';
import { RPC_URL } from '../src/config';
import { theme } from '../styles/theme';
import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material';
import HeroLayout from '../src/components/HeroLayout';
import StakeButtons from '../src/components/StakeButtons';

require('@solana/wallet-adapter-react-ui/styles.css');

export default function Home() {
  const endpoint = useMemo(() => RPC_URL, []);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Head>
            <title>The Serpent Lair</title>
            <meta
              name="description"
              content="Stake your Infinity Serpent for $ICE"
            />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <ThemeProvider theme={theme}>
            <Box
              sx={{
                backgroundImage: "url('background.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
              }}
            >
              <HeroLayout />
              <Staker />
            </Box>
            <StakeButtons />
          </ThemeProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
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
