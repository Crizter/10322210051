// src/api/urlApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export const shortenURL = async ({ longUrl, validity, shortcode }) => {
  const response = await axios.post(`${API_BASE_URL}/shorturls`, {
    originalUrl: longUrl,
    ...(validity && { validity: parseInt(validity) }),
    ...(shortcode && { shortcode })
  });
  return response.data;
};

export const getURLStats = async (shortcode) => {
  const response = await axios.get(`${API_BASE_URL}/shorturls/${shortcode}/stats`);
  return response.data;
};