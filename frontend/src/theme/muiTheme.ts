import { createTheme } from '@mui/material/styles';

const getMuiTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#4f46e5', // Tailwind Indigo 600
        light: '#818cf8', // Tailwind Indigo 400
        dark: '#3730a3', // Tailwind Indigo 800
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#16a34a', // Tailwind Green 600
        light: '#4ade80', // Tailwind Green 400
        dark: '#166534', // Tailwind Green 800
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#0f172a' : '#f8fafc', // Tailwind Slate 900 vs Slate 50
        paper: isDark ? '#1e293b' : '#ffffff', // Tailwind Slate 800 vs White
      },
      text: {
        primary: isDark ? '#f8fafc' : '#0f172a', // Tailwind Slate 50 vs Slate 900
        secondary: isDark ? '#94a3b8' : '#475569', // Tailwind Slate 400 vs Slate 600
      },
      divider: isDark ? '#334155' : '#e2e8f0', // Tailwind Slate 700 vs Slate 200
    },
    typography: {
      fontFamily: [
        'Inter',
        'system-ui',
        '-apple-system',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 800,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            padding: '10px 24px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: isDark ? '1px solid #334155' : '1px solid #e2e8f0', // Slate 700 vs Slate 200
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            borderRadius: 16,
            backgroundImage: 'none', // Remove default MUI dark paper overlay
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          },
          head: {
            backgroundColor: isDark ? '#1e293b' : '#f8fafc',
            color: isDark ? '#94a3b8' : '#475569',
            fontWeight: 700,
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          icon: {
            color: isDark ? '#94a3b8' : '#475569',
          }
        }
      }
    },
  });
};

export default getMuiTheme;
