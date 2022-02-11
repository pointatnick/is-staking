import Box from '@mui/material/Box';

export default function SerpentItem(props: any) {
  return (
    <Box
      sx={{
        backgroundColor: 'secondary.main',
        boxShadow: `8px 8px`,
        color: 'secondary.dark',
        display: 'flex',
      }}
    >
      {props.children}
    </Box>
  );
}
