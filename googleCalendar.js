const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const credentialsPath = path.join(__dirname, 'credentials.json');

const loadCredentials = () => {
  try {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath));
    const { client_id, client_secret, redirect_uris } = credentials.web || {};

    if (!client_id || !client_secret || !redirect_uris) {
      throw new Error('Invalid credentials: Missing client_id, client_secret, or redirect_uris.');
    }

    return { client_id, client_secret, redirect_uris };
  } catch (error) {
    console.error('Error loading credentials.json:', error);
    process.exit(1);
  }
};

const { client_id, client_secret, redirect_uris } = loadCredentials();

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

oAuth2Client.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
    console.log('Received new refresh token:', tokens.refresh_token);
  }
  console.log('Received new access token:', tokens.access_token);
  oAuth2Client.setCredentials(tokens);
});

const getAuthUrl = () => oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/calendar.events'],
});

const addEventToCalendar = async (event) => {
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    console.log('Event added to Google Calendar:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding event to Google Calendar:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = { getAuthUrl, addEventToCalendar, oAuth2Client };