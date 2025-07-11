const express = require('express');
const cors = require('cors');
const { urlValidationRules, validate } = require('./middleware/validator');
const { URL } = require('url');
const generateShortcode = require('./utils/shortcode');
const Url = require('./models/Url');
const { Logger } = require('../Middleware/dist');
const getMockGeoLocation = require('./utils/geoLocation');

// Initialize logger globally
const logger = new Logger({
  enableConsole: true,
  authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIxMDMyMjIxMDA1MUBzdHUuc3JtdW5pdmVyc2l0eS5hYy5pbiIsImV4cCI6MTc1MjIyMzQxOSwiaWF0IjoxNzUyMjIyNTE5LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiOGY5NThmOTYtNTk0YS00Mjg4LWE2NTktZTQxOGJkZDQyYmFkIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiaGFyc2ggc2hhcm1hIiwic3ViIjoiMGRkYmU3ZDktY2M0Ny00MzlmLWI3YjctNmJmZDIxNDdlN2VhIn0sImVtYWlsIjoiMTAzMjIyMTAwNTFAc3R1LnNybXVuaXZlcnNpdHkuYWMuaW4iLCJuYW1lIjoiaGFyc2ggc2hhcm1hIiwicm9sbE5vIjoiMTAzMjIyMTAwNTEiLCJhY2Nlc3NDb2RlIjoiRmJHZ0ZVIiwiY2xpZW50SUQiOiIwZGRiZTdkOS1jYzQ3LTQzOWYtYjdiNy02YmZkMjE0N2U3ZWEiLCJjbGllbnRTZWNyZXQiOiJEREpaQ1FlUm1RU3NzQnJIIn0.peqYslGuB2hF7enDG05Zv9K2nxIIYowrql73zCQj1wM"
});

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Application startup log
logger.info('backend', 'service', 'URL Shortener service starting up');

// Global error handler
const errorHandler = async (err, req, res, next) => {
  // Log the error
  await logger.error('backend', 'middleware', `Unhandled error: ${err.message}`);
  
  // Determine error type and send appropriate response
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error',
      details: err.message 
    });
  }
  
  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(409).json({ 
      error: 'Conflict',
      details: 'Resource already exists' 
    });
  }
  
  // Default error
  res.status(500).json({ 
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('backend', 'middleware', `Unhandled error: ${err.message}`);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Validate URL function
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
};

// POST route to create short URL
app.post('/shorturls', 
  urlValidationRules,
  validate,
  async (req, res, next) => {
    try {
      const { originalUrl, shortcode: requestedShortcode } = req.body;

      // Generate or validate shortcode
      let shortcode = requestedShortcode;
      if (!shortcode) {
        shortcode = await generateShortcode();
      } else {
        // Check for existing shortcode
        const existing = await Url.findOne({ shortcode });
        if (existing) {
          await logger.warn('backend', 'handler', `Shortcode conflict: ${shortcode}`);
          return res.status(409).json({ error: 'Shortcode already exists' });
        }
      }

      // Set expiry (30 minutes)
      const expiry = new Date(Date.now() + 30 * 60 * 1000);

      // Create URL document
      const newUrl = new Url({
        originalUrl,
        shortcode,
        createdAt: new Date(),
        expiry,
        clicks: 0
      });

      await newUrl.save();
      
      await logger.info('backend', 'handler', `Created short URL: ${shortcode}`);

      res.status(201).json({
        originalUrl,
        shortcode,
        shortUrl: `${process.env.BASE_URL}/shorturls/${shortcode}`,
        expiry
      });

    } catch (error) {
      next(error); // Pass to error handler
    }
});

// Update GET endpoint to handle redirects and click tracking
app.get('/shorturls/:shortcode', 
  param('shortcode')
    .isAlphanumeric()
    .isLength({ min: 5, max: 7 }),
  validate,
  async (req, res, next) => {
    try {
      const { shortcode } = req.params;
      
      const url = await Url.findOne({ shortcode });
      
      if (!url) {
        await logger.warn('backend', 'handler', `Short URL not found: ${shortcode}`);
        return res.status(404).json({ error: 'Short URL not found' });
      }

      if (url.expiry && url.expiry < new Date()) {
        await logger.info('backend', 'handler', `Expired URL accessed: ${shortcode}`);
        return res.status(410).json({ error: 'Link has expired' });
      }

      // Get mock geo location
      const geoData = getMockGeoLocation();
      
      // Record click details
      const clickDetails = {
        timestamp: new Date(),
        referrer: req.headers.referer || null,
        geo: geoData
      };

      // Update URL document
      url.clicks += 1;
      url.clickDetails.push(clickDetails);
      await url.save();

      await logger.info(
        'backend', 
        'handler', 
        `Redirecting ${shortcode} to ${url.originalUrl} (clicks: ${url.clicks}, location: ${geoData.city}, ${geoData.country})`
      );

      res.redirect(url.originalUrl);

    } catch (error) {
      await logger.error('backend', 'handler', `Error processing shortcode: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// Add this new route after your existing routes
app.get('/shorturls/:shortcode/stats', async (req, res) => {
  try {
    const { shortcode } = req.params;
    
    const url = await Url.findOne({ shortcode });

    if (!url) {
      await logger.warn('backend', 'handler', `Stats requested for non-existent shortcode: ${shortcode}`);
      return res.status(404).json({ error: 'Short URL not found' });
    }

    await logger.debug('backend', 'handler', `Stats accessed for ${shortcode}`);

    const stats = {
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
      expiry: url.expiry,
      totalClicks: url.clicks,
      clickDetails: url.clickDetails.map(click => ({
        timestamp: click.timestamp,
        referrer: click.referrer || 'direct',
        geo: click.geo || 'unknown'
      }))
    };

    res.json(stats);

  } catch (error) {
    await logger.error('backend', 'handler', `Error fetching stats: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch URL statistics' });
  }
});

// Health check with logging
app.get('/health', async (req, res) => {
  await logger.debug('backend', 'handler', 'Health check requested');
  res.json({ status: 'ok' });
});

// Register error handler last
app.use(errorHandler);

// Example usage of different log levels:

// Debug - For detailed information during development
await logger.debug('backend', 'handler', 'Processing request with params...');

// Info - For general operational information
await logger.info('backend', 'service', 'Application started successfully');

// Warn - For potentially harmful situations
await logger.warn('backend', 'handler', 'Rate limit threshold reached');

// Error - For error events that might still allow the app to continue
await logger.error('backend', 'db', 'Database query failed');

// Fatal - For severe errors that prevent normal operation
await logger.fatal('backend', 'service', 'Critical service dependency unavailable');

// Example of structured logging in a route:
app.get('/example', async (req, res) => {
  try {
    await logger.debug('backend', 'handler', `Request received: ${req.path}`);
    
    // Some operation that might fail
    const result = await someOperation();
    
    await logger.info('backend', 'handler', `Operation successful: ${result}`);
    res.json(result);
  } catch (error) {
    await logger.error('backend', 'handler', `Operation failed: ${error.message}`);
    res.status(500).json({ error: 'Operation failed' });
  }
});

module.exports = app;