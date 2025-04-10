import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  const theme = useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: '"Google Sans", "Roboto", "Helvetica", "Arial", sans-serif',
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
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                primary: {
                  main: '#2196f3',
                  light: '#64b5f6',
                  dark: '#1976d2',
                  contrastText: '#ffffff',
                },
                secondary: {
                  main: '#f44336',
                  light: '#ff7961',
                  dark: '#ba000d',
                  contrastText: '#ffffff',
                },
                background: {
                  default: '#f5f5f5',
                  paper: '#ffffff',
                },
                text: {
                  primary: 'rgba(0, 0, 0, 0.87)',
                  secondary: 'rgba(0, 0, 0, 0.6)',
                },
              }
            : {
                primary: {
                  main: '#90caf9',
                  light: '#e3f2fd',
                  dark: '#42a5f5',
                  contrastText: '#000000',
                },
                secondary: {
                  main: '#ef5350',
                  light: '#ff867c',
                  dark: '#b61827',
                  contrastText: '#000000',
                },
                background: {
                  default: '#121212',
                  paper: '#1e1e1e',
                },
                text: {
                  primary: '#ffffff',
                  secondary: 'rgba(255, 255, 255, 0.7)',
                },
              }),
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
                  boxShadow: '0 12px 40px rgba(33, 150, 243, 0.12), 0 6px 16px rgba(33, 150, 243, 0.08)',
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
                  boxShadow: '0 8px 20px rgba(33, 150, 243, 0.2)',
                  transform: 'translateY(-2px)',
                },
                '&.MuiButton-contained': {
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
                  '&:hover': {
                    boxShadow: '0 8px 20px rgba(33, 150, 243, 0.3)',
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
                    boxShadow: '0 4px 16px rgba(33, 150, 243, 0.1)',
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
      }),
    [mode]
  );

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 