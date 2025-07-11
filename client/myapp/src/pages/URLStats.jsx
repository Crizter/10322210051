// src/pages/URLStats.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { format } from 'date-fns';
import { getURLStats } from '../api/urlApi';

const URLStats = ({ logger }) => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Get shortened URLs from session storage
        const shortenedUrls = JSON.parse(sessionStorage.getItem('shortened_urls') || '[]');
        
        logger.info('frontend', 'component', 'Loading URL statistics');
        
        const statsPromises = shortenedUrls.map(url => 
          getURLStats(url.shortcode)
            .catch(error => {
              logger.error('frontend', 'component', `Failed to fetch stats for ${url.shortcode}: ${error.message}`);
              return null;
            })
        );
        
        const results = await Promise.all(statsPromises);
        setStats(results.filter(Boolean));
        
        logger.info('frontend', 'component', `Loaded statistics for ${results.filter(Boolean).length} URLs`);
      } catch (error) {
        logger.error('frontend', 'component', `Error loading statistics: ${error.message}`);
      }
    };

    loadStats();
  }, [logger]);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        URL Statistics
      </Typography>
      
      {stats.map((stat, index) => (
        <Card key={index} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {stat.originalUrl}
            </Typography>
            <Typography color="text.secondary">
              Created: {format(new Date(stat.createdAt), 'PPpp')}
            </Typography>
            <Typography color="text.secondary">
              Expires: {format(new Date(stat.expiry), 'PPpp')}
            </Typography>
            <Typography sx={{ mt: 2 }}>
              Total Clicks: {stat.totalClicks}
            </Typography>
            
            {stat.clickDetails.length > 0 && (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Referrer</TableCell>
                      <TableCell>Location</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stat.clickDetails.map((click, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {format(new Date(click.timestamp), 'PPp')}
                        </TableCell>
                        <TableCell>{click.referrer || 'Direct'}</TableCell>
                        <TableCell>
                          {click.geo ? `${click.geo.city}, ${click.geo.country}` : 'Unknown'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      ))}
      
      {stats.length === 0 && (
        <Typography color="text.secondary">
          No shortened URLs found in this session.
        </Typography>
      )}
    </Box>
  );
};

export default URLStats;