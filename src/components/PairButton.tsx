import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useState } from 'react';
import LoadingProgress from './LoadingProgress';

export default function StakeButton(props: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { publicKey } = useWallet();

  const handleClick = useCallback(() => {
    setLoading(true);
    (async () => {
      if (publicKey) {
        // const { success } = await (
        //   await fetch('/api/staking/pair', {
        //     method: 'post',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //       publicKey: publicKey.toBase58(),
        //       mint: props.mint,
        //     }),
        //   })
        // ).json();
        // if (success) {
        //   // TODO: set success instead
        //   setLoading(false);
        //   location.reload();
        // } else {
        //   setLoading(false);
        //   setError(true);
        // }
      }
    })();
  }, [publicKey, props.mint, props.tokenAccount]);

  return (
    <Box sx={{ width: '100%' }}>
      {loading ? (
        <LoadingProgress />
      ) : (
        <Button
          fullWidth
          sx={{ display: 'block', backgroundColor: 'secondary.main' }}
          onClick={handleClick}
        >
          Stake
        </Button>
      )}
    </Box>
  );
}
