const express = require('express');
const cors = require('cors');
const { google } = require('googleapis'); // Import Google APIs library
const { getAuthUrl, addEventToCalendar, oAuth2Client } = require('./googleCalendar');
const mongoose = require('mongoose');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json()); // Enable JSON parsing

// In-memory tasks array
let tasks = [];

// Connect to MongoDB
const mongoURI = 'mongodb+srv://eamonr:hN7AjIOjif7sx0GF@digt2107-project.sxug0.mongodb.net/?retryWrites=true&w=majority&appName=DIGT2107-Project';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Define a Mongoose schema and model for tasks
const taskSchema = new mongoose.Schema({
  title: String,
  priority: String,
  dueDate: String,
  dueTime: String,
  synced: { type: Boolean, default: false },
});

const Task = mongoose.model('Task', taskSchema);

// POST /tasks - Add a new task
app.post('/tasks', async (req, res) => {
    try {
      const newTask = new Task(req.body); // Create a new task document
      await newTask.save(); // Save task to MongoDB
      res.status(201).json({ message: 'Task added', task: newTask });
    } catch (error) {
      console.error('Error adding task:', error);
      res.status(500).json({ message: 'Failed to add task' });
    }
  });

// GET /tasks - Retrieve all tasks
app.get('/tasks', async (req, res) => {
    try {
      const tasks = await Task.find(); // Fetch all tasks from MongoDB
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

// DELETE /tasks/:index - Delete a task by index
app.delete('/tasks/:id', async (req, res) => {
    try {
      await Task.findByIdAndDelete(req.params.id); // Delete task by ID
      res.status(200).json({ message: 'Task deleted' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ message: 'Failed to delete task' });
    }
  });
  

// Google OAuth authentication route
app.get('/auth/google', (req, res) => {
  const authUrl = getAuthUrl();
  res.send({ url: authUrl });
});

// Google OAuth callback route
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oAuth2Client.getToken(code); // Exchange code for tokens
    oAuth2Client.setCredentials(tokens); // Store tokens in client
    console.log('OAuth Tokens:', tokens); // Log tokens to ensure retrieval
    res.send('Authentication successful! You can close this tab.');
  } catch (error) {
    console.error('Error retrieving OAuth tokens:', error);
    res.status(500).send('Failed to authenticate.');
  }
});

// POST /calendar/events - Add task to Google Calendar
app.post('/calendar/events', async (req, res) => {
    const { title, priority, dueDate, dueTime, _id } = req.body;
  
    const startDateTime = dueTime
      ? new Date(`${dueDate}T${dueTime}:00`)
      : new Date(`${dueDate}T00:00:00`);
  
    const endDateTime = dueTime
      ? new Date(startDateTime.getTime() + 60 * 60 * 1000) // 1-hour event
      : new Date(`${dueDate}T23:59:59`);
  
    const event = {
      summary: `${title} - ${priority}`,
      start: { dateTime: startDateTime.toISOString(), timeZone: 'America/Toronto' },
      end: { dateTime: endDateTime.toISOString(), timeZone: 'America/Toronto' },
    };
  
    try {
      console.log('Attempting to add event:', event);
      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });
  
      console.log('Event successfully added:', response.data);
  
      // Mark the task as synced in MongoDB
      await Task.findByIdAndUpdate(_id, { synced: true });
  
      res.status(200).json({ message: 'Task synced to Google Calendar!', response: response.data });
    } catch (error) {
      console.error('Error syncing task:', error);
      res.status(500).json({ message: 'Failed to sync task', error });
    }
  });
  
  

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
