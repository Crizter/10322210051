const mongoose = require('mongoose');

const clickDetailSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  referrer: {
    type: String,
    default: null
  },
  geo: {
    type: {
      country: String,
      city: String,
      latitude: Number,
      longitude: Number
    },
    default: null
  }
});

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true
  },
  shortcode: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiry: {
    type: Date,
    default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days from now
  },
  clicks: {
    type: Number,
    default: 0
  },
  clickDetails: [clickDetailSchema]
});

// Add compound index for fast queries
urlSchema.index({ shortcode: 1, expiry: 1 });

// Add method to check if URL is expired
urlSchema.methods.isExpired = function() {
  return this.expiry && this.expiry < new Date();
};

// Add method to increment clicks
urlSchema.methods.recordClick = async function(referrer, geo) {
  this.clicks += 1;
  this.clickDetails.push({ referrer, geo });
  return this.save();
};

const Url = mongoose.model('Url', urlSchema);

module.exports = Url;