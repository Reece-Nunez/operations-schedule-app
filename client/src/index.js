import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import './index.css';

const theme = createTheme({
  components: {
    MuiContainer: {
      defaultProps: {
        maxWidth: 'xl', // You can set a default maxWidth here if needed
      },
      styleOverrides: {
        maxWidthSm: {
          maxWidth: '680px', // Customize small container max-width
        },
        maxWidthMd: {
          maxWidth: '920px', // Customize medium container max-width
        },
        maxWidthLg: {
          maxWidth: '1240px', // Customize large container max-width
        },
        maxWidthXl: {
          maxWidth: '1600px', // Customize extra-large container max-width
        },
        // Add a custom size if needed
        maxWidthXxl: {
          maxWidth: '1800px', // You can create a custom size like XXL
        },
      },
    },
  },
});


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <App />
      </UserProvider>
    </ThemeProvider>
  </React.StrictMode>
);
