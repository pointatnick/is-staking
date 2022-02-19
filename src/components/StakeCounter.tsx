import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

type LinearWithValueLabelProps = {
  stakedCount: number;
  totalSupply: number;
  nft: string;
};

function LinearProgressWithLabel(props: any) {
  const { children, ...rest } = props;
  return (
    <Box sx={{ alignItems: 'center' }}>
      <Box sx={{ width: '100%' }}>
        <LinearProgress
          sx={{
            // minWidth: '500px',
            '& .MuiLinearProgress-bar': {
              background:
                'linear-gradient(90deg, rgba(50,0,0,1) 0%, rgba(200,0,0,1) 100%)',
            },
          }}
          variant="determinate"
          {...rest}
        />
      </Box>
      {children}
    </Box>
  );
}

export default function LinearWithValueLabel(props: LinearWithValueLabelProps) {
  const { stakedCount, totalSupply, nft } = props;
  const value = (stakedCount / totalSupply) * 100;
  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgressWithLabel value={value}>
        <Box sx={{ minWidth: 35, float: 'right', padding: '0.5em 0' }}>
          <Typography
            sx={{ fontFamily: 'Cormorant Garamond', fontSize: '1.2em' }}
            variant="body2"
            color="white"
          >
            {stakedCount}/{totalSupply} {nft} staked ({value.toFixed(2)}%)
          </Typography>
        </Box>
      </LinearProgressWithLabel>
    </Box>
  );
}
