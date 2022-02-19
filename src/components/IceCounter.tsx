import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function IceCounter(props: any) {
  return (
    <Box>
      <Typography
        sx={{ color: 'white', fontFamily: 'Metamorphous' }}
        variant="h3"
      >
        2,340,985 $ICE
      </Typography>
      <Button variant="contained" onClick={handleClick}>
        Claim $ICE
      </Button>
    </Box>
  );
}

const handleClick = function () {
  console.log('claiming ICE');
};
