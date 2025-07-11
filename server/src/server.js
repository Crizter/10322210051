const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// POST route to create short URL
app.post('/shorturls', async (req, res) => {
  try {
    const { originalUrl } = req.body;
    
    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    
    const shortCode = Math.random().toString(36).substring(2, 8);
    res.json({
      originalUrl,
      shortCode,
      shortUrl: `${process.env.BASE_URL}/shorturls/${shortCode}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create short URL' });
  }
});

//  redirect to original URL
app.get('/shorturls/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;

    res.status(404).json({ error: 'Short URL not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to redirect to original URL' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;