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
  Alert
} from '@mui/material';
import { format } from 'date-fns';
import { shortenURL } from '../api/urlApi';

const URLShortener = ({ logger }) => {
  const [urls, setUrls] = useState([{ 
    longUrl: '', 
    validity: '', 
    shortcode: '' 
  }]);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    urls.forEach((url, index) => {
      if (!url.longUrl) {
        newErrors[`url-${index}`] = 'URL is required';
      } else if (!isValidUrl(url.longUrl)) {
        newErrors[`url-${index}`] = 'Invalid URL format';
      }
      
      if (url.validity && (!Number.isInteger(+url.validity) || +url.validity <= 0)) {
        newErrors[`validity-${index}`] = 'Validity must be a positive integer';
      }
      
      if (url.shortcode && !/^[a-zA-Z0-9]+$/.test(url.shortcode)) {
        newErrors[`shortcode-${index}`] = 'Shortcode must be alphanumeric';
      }
    });
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      logger.warn('frontend', 'component', 'Form validation failed');
      setErrors(validationErrors);
      return;
    }

    logger.info('frontend', 'component', 'Submitting URLs for shortening');

    try {
      const promises = urls.map(url => shortenURL(url));
      const responses = await Promise.all(promises);
      
      logger.info('frontend', 'component', `Successfully shortened ${responses.length} URLs`);
      
      setResults(responses);
      // Store in session storage
      sessionStorage.setItem('shortened_urls', JSON.stringify(responses));
      
    } catch (error) {
      logger.error('frontend', 'component', `Error shortening URLs: ${error.message}`);
      setErrors({ submit: 'Failed to shorten URLs' });
    }
  };

  const addUrlField = () => {
    if (urls.length < 5) {
      setUrls([...urls, { longUrl: '', validity: '', shortcode: '' }]);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
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
                  helperText={errors[`shortcode-${index}`]}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          onClick={addUrlField}
          disabled={urls.length >= 5}
        >
          Add Another URL
        </Button>
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
      >
        Shorten URLs
      </Button>

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
                  Short URL: {result.shortUrl}
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