const express = require('express');
const Task = require('../models/Task');
const router = express.Router();

// Add a new task
router.post('/', async (req, res, next) => {
  try {
    const newTask = new Task(req.body);
    await newTask.save();
    res.status(201).json({ message: 'Task added', task: newTask });
  } catch (error) {
    next(error);
  }
});

// Retrieve all tasks
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Delete a task by ID
router.delete('/:id', async (req, res, next) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;