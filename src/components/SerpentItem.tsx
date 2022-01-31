import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

export default function SerpentItem(props: any) {
  return (
    <Grid item xs={3} alignItems="center" justifyContent="center">
      <Paper
        square
        sx={{
          backgroundColor: 'secondary.main',
          boxShadow: `8px 8px`,
          color: 'secondary.dark',
          padding: '1em 0 0 0',
          margin: '0 2em 0 0',
        }}
      >
        {props.children}
      </Paper>
    </Grid>
  );
}
