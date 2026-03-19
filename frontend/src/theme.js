import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#C1121F',
      light: '#E63946',
      dark: '#8B0D16',
    },
    secondary: {
      main: '#B8860B',
      light: '#DAA520',
      dark: '#8B6914',
    },
    background: {
      default: '#0B0B0B',
      paper: '#151515',
    },
    text: {
      primary: '#F5F5F5',
      secondary: '#9A9A9A',
    },
    divider: 'rgba(193, 18, 31, 0.2)',
  },
  typography: {
    fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#F5F5F5',
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: '#F5F5F5',
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
      color: '#F5F5F5',
    },
    h4: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
      color: '#F5F5F5',
    },
    h5: {
      fontWeight: 600,
      color: '#F5F5F5',
    },
    h6: {
      fontWeight: 600,
      color: '#F5F5F5',
    },
    button: {
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '14px 40px',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          backgroundColor: '#C1121F',
          color: '#F5F5F5',
          boxShadow: '0 4px 20px rgba(193, 18, 31, 0.3)',
          '&:hover': {
            backgroundColor: '#E63946',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(193, 18, 31, 0.5)',
          },
        },
        outlined: {
          borderWidth: '2px',
          borderColor: 'rgba(193, 18, 31, 0.6)',
          color: '#F5F5F5',
          '&:hover': {
            borderWidth: '2px',
            borderColor: '#C1121F',
            backgroundColor: 'rgba(193, 18, 31, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#151515',
          border: '1px solid rgba(193, 18, 31, 0.15)',
          borderRadius: 0,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#151515',
          border: '1px solid rgba(193, 18, 31, 0.15)',
          borderRadius: 0,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#1F1F1F',
            '& fieldset': {
              borderColor: 'rgba(154, 154, 154, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(193, 18, 31, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#C1121F',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#9A9A9A',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#C1121F',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#1F1F1F',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0B0B0B',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(193, 18, 31, 0.3)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          fontWeight: 600,
          letterSpacing: '0.05em',
        },
      },
    },
  },
});

export default theme;
