import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Diamond } from '../../pages/api/types';

type Props = {
  diamond: Diamond;
};

export function MoltingDiamondDetails({ diamond }: Props) {
  const { name, rank } = diamond;
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
            💎 {rank}
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

export function ConsumedDiamondDetails({ diamond }: Props) {
  const { name, rank } = diamond;
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
            💎 {rank}
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
            NO ENERGY
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export function PairedDiamondDetails({
  name,
  rank,
}: {
  name: string;
  rank: number;
}) {
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
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      ></Box>
    </Box>
  );
}

export function DiamondDetails({ diamond }: Props) {
  const { name, rank, isStaked } = diamond;

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
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {isStaked ? (
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
    </Box>
  );
}
