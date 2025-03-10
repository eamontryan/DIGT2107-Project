import React, { useState, useEffect } from 'react';
import TaskService from './taskService';
import 'bootstrap/dist/css/bootstrap.min.css';

const priorityOrder = ['Low', 'Medium', 'High', 'Critical'];

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState({ title: '', priority: 'Low', dueDate: '', dueTime: '' });
  const [isAscending, setIsAscending] = useState(true);
  const [authUrl, setAuthUrl] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchAuthUrl();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await TaskService.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchAuthUrl = async () => {
    try {
      const url = await TaskService.getAuthUrl();
      setAuthUrl(url);
    } catch (error) {
      console.error('Error fetching Google Auth URL:', error);
    }
  };

  const handleInputChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const addTask = async (e) => {
    e.preventDefault();
    try {
      const newTask = await TaskService.addTask(task);
      setTasks([...tasks, { ...newTask, synced: false }]);
      setTask({ title: '', priority: 'Low', dueDate: '', dueTime: '' });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await TaskService.deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const syncTaskToCalendar = async (task) => {
    if (task.synced) return;
    try {
      await TaskService.syncTask(task);
      setTasks(tasks.map(t => t.id === task.id ? { ...t, synced: true } : t));
      alert('Task synced to Google Calendar!');
    } catch (error) {
      console.error('Error syncing task:', error);
    }
  };

  const syncAllTasks = () => {
    tasks.forEach((task) => {
      if (!task.synced) syncTaskToCalendar(task);
    });
  };

  const sortTasksByPriority = () => {
    const sortedTasks = [...tasks].sort((a, b) => {
      return isAscending
        ? priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
        : priorityOrder.indexOf(b.priority) - priorityOrder.indexOf(a.priority);
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
        <input type="text" className="form-control mb-3" name="title" placeholder="Task Title" value={task.title} onChange={handleInputChange} required />
        <select className="form-select mb-3" name="priority" value={task.priority} onChange={handleInputChange}>
          {priorityOrder.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input type="date" className="form-control mb-3" name="dueDate" value={task.dueDate} onChange={handleInputChange} required />
        <input type="time" className="form-control mb-3" name="dueTime" value={task.dueTime} onChange={handleInputChange} />
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