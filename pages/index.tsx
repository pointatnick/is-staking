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
import { RPC_URL } from '../src/config';

import MainPage from '../src/components/MainPage';

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
          <MainPage />
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
