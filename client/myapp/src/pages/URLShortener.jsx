// src/pages/URLShortener.jsx
import { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { format } from 'date-fns';

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
};

const URLShortener = ({ logger }) => {
  const [urls, setUrls] = useState([{ 
    longUrl: '', 
    validity: '', 
    shortcode: '' 
  }]);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    urls.forEach((url, index) => {
      if (!url.longUrl) {
        newErrors[`url-${index}`] = 'URL is required';
      } else if (!isValidUrl(url.longUrl)) {
        newErrors[`url-${index}`] = 'Invalid URL format';
      }
      
      if (url.validity) {
        const validityNum = parseInt(url.validity, 10);
        if (isNaN(validityNum) || validityNum <= 0) {
          newErrors[`validity-${index}`] = 'Validity must be a positive integer';
        }
      }
      
      if (url.shortcode && !/^[a-zA-Z0-9]{5,7}$/.test(url.shortcode)) {
        newErrors[`shortcode-${index}`] = 'Shortcode must be 5-7 alphanumeric characters';
      }
    });
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      await logger.warn('frontend', 'component', 'Form validation failed');
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    await logger.info('frontend', 'component', 'Submitting URLs for shortening');

    try {
      const responses = await Promise.all(
        urls.map(async url => {
          const response = await fetch('http://localhost:3000/shorturls', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              originalUrl: url.longUrl,
              ...(url.validity && { validity: parseInt(url.validity, 10) }),
              ...(url.shortcode && { shortcode: url.shortcode })
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to shorten URL');
          }

          return response.json();
        })
      );
      
      await logger.info('frontend', 'component', `Successfully shortened ${responses.length} URLs`);
      
      setResults(responses);
      // Store in session storage
      sessionStorage.setItem('shortened_urls', JSON.stringify(responses));
      setErrors({});
      
    } catch (error) {
      await logger.error('frontend', 'component', `Error shortening URLs: ${error.message}`);
      setErrors({ submit: error.message || 'Failed to shorten URLs' });
    } finally {
      setLoading(false);
    }
  };

  const addUrlField = () => {
    if (urls.length < 5) {
      setUrls([...urls, { longUrl: '', validity: '', shortcode: '' }]);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Shorten URLs
      </Typography>

      {errors.submit && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.submit}
        </Alert>
      )}

      {urls.map((url, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Long URL"
                  value={url.longUrl}
                  onChange={(e) => {
                    const newUrls = [...urls];
                    newUrls[index].longUrl = e.target.value;
                    setUrls(newUrls);
                  }}
                  error={!!errors[`url-${index}`]}
                  helperText={errors[`url-${index}`]}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Validity (minutes)"
                  type="number"
                  value={url.validity}
                  onChange={(e) => {
                    const newUrls = [...urls];
                    newUrls[index].validity = e.target.value;
                    setUrls(newUrls);
                  }}
                  error={!!errors[`validity-${index}`]}
                  helperText={errors[`validity-${index}`]}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Custom Shortcode (optional)"
                  value={url.shortcode}
                  onChange={(e) => {
                    const newUrls = [...urls];
                    newUrls[index].shortcode = e.target.value;
                    setUrls(newUrls);
                  }}
                  error={!!errors[`shortcode-${index}`]}
                  helperText={errors[`shortcode-${index}`] || '5-7 alphanumeric characters'}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={addUrlField}
          disabled={urls.length >= 5 || loading}
        >
          Add Another URL
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Shorten URLs'}
        </Button>
      </Box>

      {results.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Results
          </Typography>
          {results.map((result, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Original URL: {result.originalUrl}
                </Typography>
                <Typography variant="body1">
                  Short URL: <a href={result.shortUrl} target="_blank" rel="noopener noreferrer">{result.shortUrl}</a>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Expires: {format(new Date(result.expiry), 'PPpp')}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default URLShortener;