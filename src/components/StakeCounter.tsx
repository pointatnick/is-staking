import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const TOTAL_SUPPLY = 3333;

type LinearProgressWithLabelProps = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: number;
  numStaked: number;
};

type LinearWithValueLabelProps = {
  stakedCount: number;
};

function LinearProgressWithLabel(props: LinearProgressWithLabelProps) {
  const { numStaked, ...rest } = props;
  return (
    <Box sx={{ alignItems: 'center' }}>
      <Box sx={{ width: '100%' }}>
        <LinearProgress
          sx={{
            minWidth: '550px',
            '& .MuiLinearProgress-bar': {
              background:
                'linear-gradient(90deg, rgba(50,0,0,1) 0%, rgba(200,0,0,1) 100%)',
            },
          }}
          variant="determinate"
          {...rest}
        />
      </Box>
      <Box sx={{ minWidth: 35, float: 'right', padding: '0.5em 0' }}>
        <Typography
          sx={{ fontFamily: 'Cormorant Garamond', fontSize: '1.2em' }}
          variant="body2"
          color="white"
        >
          {numStaked}/{TOTAL_SUPPLY} staked ({props.value.toFixed(2)}%)
        </Typography>
      </Box>
    </Box>
  );
}

export default function LinearWithValueLabel(props: LinearWithValueLabelProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgressWithLabel
        value={(props.stakedCount / TOTAL_SUPPLY) * 100}
        numStaked={props.stakedCount}
      />
    </Box>
  );
}
