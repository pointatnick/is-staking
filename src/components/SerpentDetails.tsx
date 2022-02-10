import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useState, useEffect } from 'react';

export default function DiamondDetails(props: any) {
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
        padding: '2em 1em',
        backgroundColor: '#00000055',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex' }}>
        <Typography
          sx={{
            fontFamily: 'Metamorphous',
            flex: '1',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflowX: 'hidden',
            fontSize: '1em',
          }}
          gutterBottom
          variant="h6"
          component="div"
        >
          {name}
        </Typography>
        <Typography
          sx={{ fontFamily: 'Metamorphous' }}
          gutterBottom
          variant="body2"
          component="div"
        >
          🐍 {rank}
        </Typography>
      </Box>
      {time ? (
        <Box>
          <Typography
            sx={{ fontFamily: 'Cormorant Garamond', fontSize: '1em' }}
            variant="body2"
          >
            <span style={{ fontFamily: 'Metamorphous', fontSize: '0.8em' }}>
              {iceAccrued.toFixed(3)}
            </span>{' '}
            ICE to collect
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}
