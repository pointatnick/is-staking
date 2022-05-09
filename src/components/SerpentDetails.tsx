import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useState, useEffect } from 'react';
import { Serpent } from '../../pages/api/types';

type Props = {
  serpent: Serpent;
};

export function MoltingSerpentDetails({ serpent }: Props) {
  const { name, rank } = serpent;
  return (
    <Box sx={{ flex: 1 }}>
      <Box
        sx={{
          color: 'white',
          padding: '2px 8px',
          backgroundColor: '#00000055',
          display: 'flex',
          flexDirection: 'column',
          height: '50.77px',
        }}
      >
        <Box sx={{ display: 'flex' }}>
          <Typography
            sx={{
              fontFamily: 'Metamorphous',
              flex: '1',
              whiteSpace: 'nowrap',
              fontSize: '0.8em',
            }}
            gutterBottom
            variant="h6"
            component="div"
          >
            #{name.split('#')[1]}
          </Typography>
          <Typography
            sx={{ fontFamily: 'Metamorphous', fontSize: '0.8em' }}
            gutterBottom
            variant="body2"
            component="div"
          >
            🐍 {rank}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            sx={{
              fontFamily: 'Metamorphous',
              fontSize: '0.7em',
              textAlign: 'center',
            }}
            gutterBottom
            variant="h6"
            component="div"
          >
            LOCKED
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export function SerpentDetails(props: any) {
  const { icePerDay, time, name, rank, staked } = props;
  const [iceAccrued, setIceAccrued] = useState(0);
  const icePerSecond = icePerDay / 24 / 60 / 60;
  const stakedDate = Date.parse(time);

  useEffect(() => {
    let timer: any;
    if (staked) {
      timer = setInterval(() => {
        const nowDate = new Date().toISOString();
        const now = Date.parse(nowDate);
        const diff = now - stakedDate;

        // use diff to calculate ICE so far
        const seconds = Math.floor(diff / 1000);
        const iceAccrued = icePerSecond * seconds;
        setIceAccrued(iceAccrued);
      }, 1000 /* one second */);
    }
    return function cleanup() {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [time, icePerSecond, staked, stakedDate]);

  return (
    <Box
      sx={{
        color: 'white',
        padding: '2px 8px',
        backgroundColor: '#00000055',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '50.77px',
      }}
    >
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <Typography
          sx={{
            fontFamily: 'Metamorphous',
            flex: '1',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflowX: 'hidden',
            fontSize: '0.8em',
          }}
          gutterBottom
          variant="h6"
          component="div"
        >
          #{name.split('#')[1]}
        </Typography>
        <Typography
          sx={{ fontFamily: 'Metamorphous', fontSize: '0.8em' }}
          gutterBottom
          variant="body2"
          component="div"
        >
          🐍 {rank}
        </Typography>
      </Box>
      {props.staked ? (
        <Typography
          sx={{
            fontFamily: 'Metamorphous',
            fontSize: '0.7em',
            textAlign: 'center',
          }}
          gutterBottom
          variant="h6"
          component="div"
        >
          STAKED
        </Typography>
      ) : null}
    </Box>
  );
}
