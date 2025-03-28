const express = require('express');
const { addEventToCalendar, oAuth2Client } = require('../googleCalendar');
const Task = require('../models/Task');
const router = express.Router();

router.post('/events', async (req, res, next) => {
  const { title, priority, dueDate, dueTime, _id } = req.body;
  
  const startDateTime = dueTime
    ? new Date(`${dueDate}T${dueTime}:00`)
    : new Date(`${dueDate}T00:00:00`);

  const endDateTime = dueTime
    ? new Date(startDateTime.getTime() + 60 * 60 * 1000) // 1-hour event
    : new Date(`${dueDate}T23:59:59`);

  const event = {
    summary: `${title} - ${priority}`,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'America/Toronto',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'America/Toronto',
    },
  };

  try {
    console.log('Adding event:', event);
    const response = await addEventToCalendar(event);
    await Task.findByIdAndUpdate(_id, { synced: true });
    res.status(200).json({ message: 'Task synced to Google Calendar!', response });
  } catch (error) {
    next(error);
  }
});

module.exports = router;