// Update App.jsx with routing and Material UI setup:
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
import { Logger } from '../../../Middleware/dist';
import URLShortener from './pages/URLShortener';
import URLStats from './pages/URLStats';

// Initialize logger
const logger = new Logger({
  enableConsole: true,
  authToken: "your_auth_token_here"
});

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
              <Route path="/" element={<URLShortener logger={logger} />} />
              <Route path="/stats" element={<URLStats logger={logger} />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;