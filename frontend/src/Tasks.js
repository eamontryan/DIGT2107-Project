import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

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
      .then((response) => {
        setTasks([...tasks, { ...task, id: response.data.id, synced: false }]);
        setTask({ title: '', priority: 'Low', dueDate: '', dueTime: '' });
      })
      .catch(error => console.error('Error adding task:', error));
  };

  const deleteTask = (taskId) => {
    axios.delete(`http://localhost:3001/tasks/${taskId}`)
      .then(() => {
        setTasks(tasks.filter((task) => task.id !== taskId));
      })
      .catch(error => console.error('Error deleting task:', error));
  };

  const syncTaskToCalendar = (task) => {
    if (task.synced) return;
    axios.post('http://localhost:3001/calendar/events', task)
      .then(() => {
        const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, synced: true } : t);
        setTasks(updatedTasks);
        alert('Task synced to Google Calendar!');
      })
      .catch(error => console.error('Error syncing task to calendar:', error));
  };

  const syncAllTasks = () => {
    tasks.forEach((task) => {
      if (!task.synced) {
        syncTaskToCalendar(task);
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
    <div className="container mt-5">
      {authUrl && (
        <a className="btn btn-outline-primary d-block mx-auto mb-3" href={authUrl} target="_blank" rel="noopener noreferrer">
          Authenticate with Google Calendar
        </a>
      )}

      <form className="card p-4 shadow-sm mb-4" onSubmit={addTask}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Task Title"
            value={task.title}
            onChange={e => setTask({ ...task, title: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <select className="form-select" value={task.priority} onChange={e => setTask({ ...task, priority: e.target.value })}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div className="mb-3">
          <input
            type="date"
            className="form-control"
            value={task.dueDate}
            onChange={e => setTask({ ...task, dueDate: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="time"
            className="form-control"
            value={task.dueTime}
            onChange={e => setTask({ ...task, dueTime: e.target.value })}
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Add Task</button>
      </form>

      <button className="btn btn-secondary me-2" onClick={sortTasksByPriority}>
        {isAscending ? 'Sort Descending' : 'Sort Ascending'}
      </button>
      <button className="btn btn-success" onClick={syncAllTasks}>Sync All</button>

      <ul className="list-group mt-4">
        {tasks.map((task) => (
          <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>{task.title} - {task.priority} - Due: {task.dueDate} {task.dueTime && `at ${task.dueTime}`}</span>
            <div>
              <button className="btn btn-outline-success me-2" disabled={task.synced} onClick={() => syncTaskToCalendar(task)}>
                {task.synced ? 'Synced' : 'Sync'}
              </button>
              <button className="btn btn-danger" onClick={() => deleteTask(task.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;