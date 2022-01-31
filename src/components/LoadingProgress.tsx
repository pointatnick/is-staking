import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export default function LoadingProgress() {
  return (
    <Box sx={{ display: 'flex', color: 'white' }}>
      <CircularProgress color="inherit" size={20} sx={{ margin: '1em auto' }} />
    </Box>
  );
}
