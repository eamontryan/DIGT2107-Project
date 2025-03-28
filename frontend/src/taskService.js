import axios from 'axios';

const API_URL = 'https://digt2107-project.onrender.com';

const getTasks = async () => {
  const response = await axios.get(`${API_URL}/tasks`);
  return response.data;
};

const getAuthUrl = async () => {
  const response = await axios.get(`${API_URL}/auth/google`);
  return response.data.url;
};

const addTask = async (task) => {
  const response = await axios.post(`${API_URL}/tasks`, task);
  return response.data.task;
};

const deleteTask = async (taskId) => {
  await axios.delete(`${API_URL}/tasks/${taskId}`);
};

const syncTask = async (task) => {
  await axios.post(`${API_URL}/calendar/events`, task);
};

export default { getTasks, getAuthUrl, addTask, deleteTask, syncTask };