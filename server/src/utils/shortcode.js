const Url = require('../models/Url');

const generateShortcode = async (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const maxAttempts = 5; // Prevent infinite loops
  let attempts = 0;

  while (attempts < maxAttempts) {
    // Generate random shortcode
    let shortcode = '';
    const codeLength = Math.floor(Math.random() * (8 - 5) + 5); // Random length between 5-7
    
    for (let i = 0; i < codeLength; i++) {
      shortcode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check if shortcode already exists in DB
    const exists = await Url.findOne({ shortcode });
    
    if (!exists) {
      return shortcode;
    }

    attempts++;
  }

  throw new Error('Failed to generate unique shortcode after maximum attempts');
};

module.exports = generateShortcode;