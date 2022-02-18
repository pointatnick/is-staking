import Box from '@mui/material/Box';

export default function SerpentItem(props: any) {
  return (
    <Box
      sx={{
        backgroundColor: props.selected ? 'gold' : 'secondary.main',
        color: 'secondary.dark',
        display: 'flex',
        flexDirection: 'column',
        height: '156.77px',
      }}
    >
      {props.children}
    </Box>
  );
}
