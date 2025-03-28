const { google } = require('googleapis');
require('dotenv').config();

// Load credentials from environment variables
const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;
const redirect_uris = process.env.GOOGLE_REDIRECT_URI;

if (!client_id || !client_secret || !redirect_uris) {
  console.error('Missing Google API credentials in environment variables.');
  process.exit(1);
}

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

oAuth2Client.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
    console.log('Received new refresh token:', tokens.refresh_token);
  }
  console.log('Received new access token:', tokens.access_token);
  oAuth2Client.setCredentials(tokens);
});

// Generate the authentication URL
const getAuthUrl = () => {
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
  });
};

// Add an event to Google Calendar
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