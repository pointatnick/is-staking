import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function DiamondDetails(props: any) {
  const { iceToCollect, name, rank, staked } = props;

  return (
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
          💎 {rank}
        </Typography>
      </Box>
      {staked ? (
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
