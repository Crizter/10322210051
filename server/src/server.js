const express = require('express');
const cors = require('cors');
const { URL } = require('url');
const generateShortcode = require('./utils/shortcode');
const Url = require('./models/Url');
const { Logger } = require('../Middleware/dist');

const app = express();
const logger = new Logger({
  enableConsole: true,
  authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIxMDMyMjIxMDA1MUBzdHUuc3JtdW5pdmVyc2l0eS5hYy5pbiIsImV4cCI6MTc1MjIyMzQxOSwiaWF0IjoxNzUyMjIyNTE5LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiOGY5NThmOTYtNTk0YS00Mjg4LWE2NTktZTQxOGJkZDQyYmFkIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiaGFyc2ggc2hhcm1hIiwic3ViIjoiMGRkYmU3ZDktY2M0Ny00MzlmLWI3YjctNmJmZDIxNDdlN2VhIn0sImVtYWlsIjoiMTAzMjIyMTAwNTFAc3R1LnNybXVuaXZlcnNpdHkuYWMuaW4iLCJuYW1lIjoiaGFyc2ggc2hhcm1hIiwicm9sbE5vIjoiMTAzMjIyMTAwNTEiLCJhY2Nlc3NDb2RlIjoiRmJHZ0ZVIiwiY2xpZW50SUQiOiIwZGRiZTdkOS1jYzQ3LTQzOWYtYjdiNy02YmZkMjE0N2U3ZWEiLCJjbGllbnRTZWNyZXQiOiJEREpaQ1FlUm1RU3NzQnJIIn0.peqYslGuB2hF7enDG05Zv9K2nxIIYowrql73zCQj1wM"
});


// middleware
app.use(cors());
app.use(express.json());

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
app.post('/shorturls', async (req, res) => {
  try {
    const { originalUrl, shortcode: requestedShortcode } = req.body;
    
    // 1. Validate input URL
    if (!originalUrl) {
      logger.error('backend', 'handler', 'Missing originalUrl in request');
      return res.status(400).json({ error: 'Original URL is required' });
    }

    if (!isValidUrl(originalUrl)) {
      logger.error('backend', 'handler', `Invalid URL format: ${originalUrl}`);
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // 2 & 3. Handle shortcode (generate or validate)
    let shortcode;
    if (requestedShortcode) {
      // Check if requested shortcode exists
      const existing = await Url.findOne({ shortcode: requestedShortcode });
      if (existing) {
        logger.warn('backend', 'handler', `Shortcode conflict: ${requestedShortcode}`);
        return res.status(409).json({ error: 'Requested shortcode already exists' });
      }
      shortcode = requestedShortcode;
    } else {
      shortcode = await generateShortcode();
    }

    // 4. Set expiry (30 minutes from now)
    const expiry = new Date(Date.now() + 30 * 60 * 1000);

    // 5. Create and save URL document
    const newUrl = new Url({
      originalUrl,
      shortcode,
      createdAt: new Date(),
      expiry,
      clicks: 0
    });

    await newUrl.save();

    logger.info('backend', 'handler', `Created short URL: ${shortcode} for ${originalUrl}`);

    // Return success response
    return res.status(201).json({
      originalUrl,
      shortcode,
      shortUrl: `${process.env.BASE_URL}/shorturls/${shortcode}`,
      expiry
    });

  } catch (error) {
    logger.error('backend', 'handler', `Error creating short URL: ${error.message}`);
    res.status(500).json({ 
      error: 'Failed to create short URL',
      details: error.message 
    });
  }
});

// Update GET endpoint to handle redirects and click tracking
app.get('/shorturls/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;
    
    // Find URL document
    const url = await Url.findOne({ shortcode });
    
    // Log and handle not found
    if (!url) {
      await logger.warn('backend', 'handler', `Short URL not found: ${shortcode}`);
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Check expiry
    if (url.expiry && url.expiry < new Date()) {
      await logger.info('backend', 'handler', `Expired URL accessed: ${shortcode}`);
      return res.status(410).json({ error: 'Link has expired' });
    }

    // Mock geo data (in production, use a real geo-ip service)
    const mockGeo = {
      country: 'IN',
      city: 'Chennai',
      latitude: 13.0827,
      longitude: 80.2707
    };

    // Record click details
    const clickDetails = {
      timestamp: new Date(),
      referrer: req.headers.referer || null,
      geo: mockGeo
    };

    // Update URL document with click info
    url.clicks += 1;
    url.clickDetails.push(clickDetails);
    await url.save();

    // Log successful redirect
    await logger.info(
      'backend', 
      'handler', 
      `Redirecting ${shortcode} to ${url.originalUrl} (clicks: ${url.clicks})`
    );

    // Perform redirect
    res.redirect(url.originalUrl);

  } catch (error) {
    await logger.error(
      'backend', 
      'handler', 
      `Error processing shortcode ${req.params.shortcode}: ${error.message}`
    );
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;