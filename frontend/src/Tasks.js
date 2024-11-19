import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Tasks.css';

const priorityOrder = ['Low', 'Medium', 'High', 'Critical'];

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState({ title: '', priority: 'Low', dueDate: '', dueTime: '' });
  const [isAscending, setIsAscending] = useState(true);
  const [authUrl, setAuthUrl] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/tasks')
      .then(response => setTasks(response.data))
      .catch(error => console.error('Error fetching tasks:', error));

    axios.get('http://localhost:3001/auth/google')
      .then(response => setAuthUrl(response.data.url))
      .catch(error => console.error('Error fetching Google Auth URL:', error));
  }, []);

  const addTask = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/tasks', task)
      .then(() => {
        setTasks([...tasks, { ...task, synced: false }]);
        setTask({ title: '', priority: 'Low', dueDate: '', dueTime: '' });
      })
      .catch(error => console.error('Error adding task:', error));
  };

  const deleteTask = (index) => {
    axios.delete(`http://localhost:3001/tasks/${index}`)
      .then(() => {
        setTasks(tasks.filter((_, i) => i !== index));
      })
      .catch(error => console.error('Error deleting task:', error));
  };

  const syncTaskToCalendar = (task, index) => {
    if (task.synced) return;
    axios.post('http://localhost:3001/calendar/events', task)
      .then(() => {
        const updatedTasks = [...tasks];
        updatedTasks[index].synced = true;
        setTasks(updatedTasks);
        alert('Task synced to Google Calendar!');
      })
      .catch(error => console.error('Error syncing task to calendar:', error));
  };

  const syncAllTasks = () => {
    tasks.forEach((task, index) => {
      if (!task.synced) {
        syncTaskToCalendar(task, index);
      }
    });
  };

  const sortTasksByPriority = () => {
    const sortedTasks = [...tasks].sort((a, b) => {
      const aPriority = priorityOrder.indexOf(a.priority);
      const bPriority = priorityOrder.indexOf(b.priority);
      return isAscending ? aPriority - bPriority : bPriority - aPriority;
    });
    setTasks(sortedTasks);
    setIsAscending(!isAscending);
  };

  return (
    <div>
      <h1>Task Management</h1>

      {authUrl && (
        <a href={authUrl} target="_blank" rel="noopener noreferrer">
          Authenticate with Google Calendar
        </a>
      )}

      <form onSubmit={addTask}>
        <input
          type="text"
          placeholder="Task Title"
          value={task.title}
          onChange={e => setTask({ ...task, title: e.target.value })}
          required
        />
        <select
          value={task.priority}
          onChange={e => setTask({ ...task, priority: e.target.value })}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
        <input
          type="date"
          value={task.dueDate}
          onChange={e => setTask({ ...task, dueDate: e.target.value })}
          required
        />
        <input
          type="time"
          value={task.dueTime}
          onChange={e => setTask({ ...task, dueTime: e.target.value })}
        />
        <button type="submit">Add Task</button>
      </form>

      <button onClick={sortTasksByPriority}>
        {isAscending ? 'Sort Descending' : 'Sort Ascending'}
      </button>
      <button onClick={syncAllTasks}>Sync All</button>

      <ul>
        {tasks.map((task, index) => (
          <li key={index}>
            {task.title} - {task.priority} - Due: {task.dueDate} {task.dueTime && `at ${task.dueTime}`}
            {task.synced ? <span className="badge">Synced</span> : null}
            <button disabled={task.synced} onClick={() => syncTaskToCalendar(task, index)}>
              {task.synced ? 'Synced' : 'Sync'}
            </button>
            <button onClick={() => deleteTask(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
