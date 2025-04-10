import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    body1: {
      letterSpacing: '0.01em',
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    body2: {
      letterSpacing: '0.01em',
      fontSize: '0.875rem',
      lineHeight: 1.7,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1.1rem',
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.9rem',
      letterSpacing: '0.01em',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.03)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12), 0 6px 16px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '8px 24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)',
          },
          '&.MuiButton-contained': {
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
            '&:hover': {
              boxShadow: '0 8px 20px rgba(25, 118, 210, 0.3)',
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
            },
            '&.Mui-focused': {
              boxShadow: '0 4px 16px rgba(25, 118, 210, 0.1)',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.08), 2px 0 8px rgba(0, 0, 0, 0.04)',
        },
      },
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
});

export default theme; 