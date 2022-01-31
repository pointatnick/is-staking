import styles from '../../styles/Staker.module.css';
import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import SerpentItem from './SerpentItem';
import SerpentImage from './SerpentImage';
import SerpentDetails from './SerpentDetails';
import StakeButton from './StakeButton';
import UnstakeButton from './UnstakeButton';
import HeroLayout from './HeroLayout';
import Skeleton from '@mui/material/Skeleton';
import { PublicKey } from '@solana/web3.js';
import { DAO_PUBLIC_KEY } from '../config';
import { Serpent } from '../../pages/api/types';

const Placeholder = () => {
  return (
    <Grid item xs={3}>
      <Skeleton variant="rectangular" height={500}></Skeleton>
    </Grid>
  );
};

export default function Staker() {
  // todo: write type
  const [serpents, setSerpents] = useState<any[]>([]);
  // todo: write type
  const [stakedSerpents, setStakedSerpents] = useState<any[]>([]);
  const [totalStaked, setTotalStaked] = useState(0);
  const [activeTab, setActiveTab] = useState(0); // 0=staked, 1=unstaked
  const [loading, setLoading] = useState(true);
  const { connection } = useConnection();
  const { publicKey, wallet } = useWallet();

  // get total staked
  useEffect(() => {
    (async () => {
      const { numStaked } = await (
        await fetch(`/api/serpents/totalStaked`)
      ).json();
      setTotalStaked(numStaked);
    })();
  }, []);

  // get serpents
  useEffect(() => {
    if (publicKey) {
      (async () => {
        setLoading(true);

        const { serpents: allSerpents } = await (
          await fetch(`/api/serpents`)
        ).json();
        const mints = allSerpents.map((item: Serpent) => item.mint);

        if (activeTab) {
          const { serpentMints } = await (
            await fetch(`/api/serpents/owned?publicKey=${publicKey.toString()}`)
          ).json();

          // get serpents from user
          setSerpents(
            serpentMints.map((item: any) => {
              // for getting metadata from allSerpents
              const index = mints.indexOf(item.mint);
              const { rank, name, imageUrl } = allSerpents[index];

              return {
                ...item,
                rank,
                name,
                imageUrl,
              };
            })
          );

          setLoading(false);
        } else {
          const { stakedSerpentMints, stakedSerpents: allStakedSerpents } =
            await (
              await fetch(
                `/api/serpents/staked?publicKey=${publicKey.toString()}`
              )
            ).json();
          console.log(allStakedSerpents);
          const stakedMintsForUser: any[] = [];

          await Promise.all(
            stakedSerpentMints.map(async (item: any) => {
              // for getting metadata from rarityResponse
              const index = mints.indexOf(item.mint);
              const tokenAta = new PublicKey(item.tokenAccount);

              try {
                // get most recent signature for ATA
                const signature = (
                  await connection.getSignaturesForAddress(tokenAta)
                )[0].signature;
                // get tx data
                const tx = await connection.getConfirmedTransaction(
                  signature,
                  'confirmed'
                );

                // determine if diamond ended up with DAO in most recent ATA transaction
                if (tx?.meta?.postTokenBalances) {
                  for (const balance of tx.meta.postTokenBalances) {
                    if (
                      balance.owner === DAO_PUBLIC_KEY.toString() &&
                      balance.uiTokenAmount.uiAmount === 1
                    ) {
                      // found a serpent in the DAO from this ATA
                      // get metadata
                      const {
                        rank,
                        name,
                        imageUrl,
                        lastStaked,
                        isStaked,
                        icePerDay,
                      } = allSerpents[index];
                      stakedMintsForUser.push({
                        ...item,
                        rank,
                        name,
                        imageUrl,
                        lastStaked,
                        isStaked,
                        icePerDay,
                      });
                      break;
                    }
                  }
                }
              } catch (err) {
                console.error(item.mint, err);
              }
            })
          );

          setStakedSerpents(stakedMintsForUser);

          setLoading(false);
        }
      })();
    }
  }, [publicKey, connection, wallet, activeTab]);

  const handleTabChange = (newValue: any) => {
    setActiveTab(newValue);
  };

  const sortedSerpents = serpents
    .sort((a, b) => {
      return a.rank > b.rank ? 1 : -1;
    })
    .map(({ name, imageUrl, rank, mint, tokenAccount }) => (
      <SerpentItem key={name}>
        <SerpentImage image={imageUrl} />
        <SerpentDetails name={name} rank={rank} />
        <StakeButton mint={mint} tokenAccount={tokenAccount} />
      </SerpentItem>
    ));

  const sortedStakedSerpents = stakedSerpents
    .sort((a, b) => {
      return a.rank > b.rank ? 1 : -1;
    })
    .map(
      ({
        mint,
        imageUrl,
        name,
        rank,
        icePerDay,
        tokenAccount,
        lastStaked,
        isStaked,
      }) => (
        <SerpentItem key={name}>
          <SerpentImage image={imageUrl} />
          <SerpentDetails
            time={lastStaked}
            name={name}
            rank={rank}
            icePerDay={icePerDay}
            staked={isStaked}
          />
          <UnstakeButton mint={mint} name={name} tokenAccount={tokenAccount} />
        </SerpentItem>
      )
    );

  return (
    <Box
      sx={{
        backgroundImage: "url('background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <HeroLayout
        handleTabChange={handleTabChange}
        stakedCount={totalStaked}
        ownerStaked={stakedSerpents}
      />
      <Box component="main" className={styles.main}>
        {publicKey ? (
          loading ? (
            <Grid container spacing={4} sx={{ padding: '0 200px' }}>
              <Placeholder />
              <Placeholder />
              <Placeholder />
              <Placeholder />
            </Grid>
          ) : (
            <Grid
              container
              columnSpacing={0}
              rowSpacing={4}
              sx={{ padding: '0 200px' }}
            >
              {activeTab ? (
                serpents.length === 0 ? (
                  <Grid item xs={12}>
                    <div className={styles.infoText}>You have no serpents</div>
                  </Grid>
                ) : (
                  sortedSerpents
                )
              ) : stakedSerpents.length === 0 ? (
                <Grid item xs={12}>
                  <div className={styles.infoText}>
                    You have no staked serpents
                  </div>
                </Grid>
              ) : (
                sortedStakedSerpents
              )}
            </Grid>
          )
        ) : (
          <div className={styles.infoText}>Please connect your wallet</div>
        )}
      </Box>
    </Box>
  );
}
