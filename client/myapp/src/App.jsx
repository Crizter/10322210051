import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
import URLShortener from './pages/URLShortener';
import URLStats from './pages/URLStats';

// Import Logger and initialize it
const Logger = {
  debug: async (stack, pkg, message) => {
    console.debug(`[${stack}:${pkg}] ${message}`);
    // You can implement actual logger integration later
  },
  info: async (stack, pkg, message) => {
    console.info(`[${stack}:${pkg}] ${message}`);
  },
  warn: async (stack, pkg, message) => {
    console.warn(`[${stack}:${pkg}] ${message}`);
  },
  error: async (stack, pkg, message) => {
    console.error(`[${stack}:${pkg}] ${message}`);
  }
};

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                URL Shortener
              </Typography>
              <Button color="inherit" component={Link} to="/">
                Shorten URLs
              </Button>
              <Button color="inherit" component={Link} to="/stats">
                Statistics
              </Button>
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Routes>
              <Route path="/" element={<URLShortener logger={Logger} />} />
              <Route path="/stats" element={<URLStats logger={Logger} />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;