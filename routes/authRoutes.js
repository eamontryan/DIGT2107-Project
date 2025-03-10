const express = require('express');
const { getAuthUrl, oAuth2Client } = require('../googleCalendar');
const router = express.Router();

// Get Google OAuth URL
router.get('/google', (req, res) => {
  res.send({ url: getAuthUrl() });
});

// Handle Google OAuth callback
router.get('/google/callback', async (req, res, next) => {
  try {
    const { code } = req.query;
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    console.log('OAuth Tokens:', tokens);
    res.send('Authentication successful! You can close this tab.');
  } catch (error) {
    next(error);
  }
});

module.exports = router;