import Box from '@mui/material/Box';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { Serpent } from '../../pages/api/types';
import { DAO_PUBLIC_KEY } from '../config';
import NftImage from './NftImage';
import SerpentDetails from './SerpentDetails';
import SerpentItem from './SerpentItem';

const SerpentsGroup = function (props: any) {
  // todo: write type
  const [serpents, setSerpents] = useState<any[]>([]);
  // todo: write type
  const [stakedSerpents, setStakedSerpents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { connection } = useConnection();
  const { publicKey, wallet } = useWallet();
  // get serpents
  useEffect(() => {
    if (publicKey) {
      (async () => {
        setLoading(true);

        const { serpents: allSerpents } = await (
          await fetch(`/api/serpents`)
        ).json();
        const mints = allSerpents.map((item: Serpent) => item.mint);

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

        const { stakedSerpentMints, stakedSerpents: allStakedSerpents } =
          await (
            await fetch(
              `/api/serpents/staked?publicKey=${publicKey.toString()}`
            )
          ).json();
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
      })();
    }
  }, [publicKey, connection, wallet]);

  const sortedSerpents = serpents
    .sort((a, b) => {
      return a.rank > b.rank ? 1 : -1;
    })
    .map(({ name, imageUrl, rank, mint, tokenAccount }) => (
      <SerpentItem key={mint}>
        <NftImage image={imageUrl} />
        <SerpentDetails name={name} rank={rank} />
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
        <SerpentItem key={mint}>
          <NftImage image={imageUrl} />
          <SerpentDetails name={name} rank={rank} staked={isStaked} />
        </SerpentItem>
      )
    );

  return loading ? null : (
    <Box
      sx={{
        display: 'flex',
        gap: '8px',
        flex: 1,
        flexWrap: 'wrap',
        // background: '#00000055',
        padding: '8px',
      }}
    >
      {sortedStakedSerpents}
      {sortedSerpents}
    </Box>
  );
};

export default SerpentsGroup;
