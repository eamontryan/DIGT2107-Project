const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Load OAuth2 credentials
let credentials;
try {
  credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'credentials.json')));
} catch (error) {
  console.error('Failed to load credentials.json. Ensure it exists and is properly formatted.', error);
  process.exit(1); // Exit if credentials are missing
}

const { client_id, client_secret, redirect_uris } = credentials.web || {};

if (!client_id || !client_secret || !redirect_uris) {
  console.error('Invalid credentials: Missing client_id, client_secret, or redirect_uris.');
  process.exit(1);
}

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Listen for new tokens and log them
oAuth2Client.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
    console.log('Received new refresh token:', tokens.refresh_token);
  }
  console.log('Received new access token:', tokens.access_token);
  oAuth2Client.setCredentials(tokens); // Ensure tokens are stored
});

const getAuthUrl = () => {
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline', // Required to get a refresh token
    prompt: 'consent', // Ensures Google always shows the consent screen
    scope: ['https://www.googleapis.com/auth/calendar.events'],
  });
};

const addEventToCalendar = async (event) => {
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    console.log('Event added to Google Calendar:', response.data); // Log success
    return response.data;
  } catch (error) {
    console.error('Error adding event to Google Calendar:', error.response?.data || error.message); // Log errors
    throw error;
  }
};

module.exports = { getAuthUrl, addEventToCalendar, oAuth2Client };
