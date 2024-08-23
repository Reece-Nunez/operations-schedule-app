import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import './index.css';

const theme = createTheme();

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
