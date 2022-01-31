import { createTheme } from '@mui/material';

export const theme = createTheme({
  typography: {
    fontFamily: [
      'Roboto',
      'Metamorphous',
      'Cormorant Garamond',
      'Roboto Mono',
      'sans-serif',
      'monospace',
    ].join(','),
  },
  palette: {
    primary: {
      dark: '#2B261D',
      light: '#6B655C',
      main: '#393226',
    },
    secondary: {
      dark: '#13161c',
      light: '#5C626B',
      main: '#262d39',
    },
  },
});
