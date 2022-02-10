import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

export default function SerpentItem(props: any) {
  return (
    <Box
      sx={{
        backgroundColor: 'secondary.main',
        boxShadow: `8px 8px`,
        color: 'secondary.dark',
        // margin: '1em',
        display: 'flex',
      }}
    >
      {props.children}
    </Box>
  );
}
