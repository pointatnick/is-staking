import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useState, useEffect } from 'react';

export default function DiamondDetails(props: any) {
  const { iceToCollect, name, rank, staked } = props;

  return (
    <Box
      sx={{
        color: 'white',
        padding: '2em 1em',
        backgroundColor: '#00000055',
        display: 'flex',
        flexDirection: 'column',
        height: '118.06px',
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
          💎 {rank}
        </Typography>
      </Box>
      {staked ? (
        <Box>
          <Typography
            sx={{ fontFamily: 'Cormorant Garamond', fontSize: '1em' }}
            variant="body2"
          >
            <span style={{ fontFamily: 'Metamorphous', fontSize: '0.8em' }}>
              {iceToCollect.toFixed(3)}
            </span>{' '}
            ICE to collect
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}
