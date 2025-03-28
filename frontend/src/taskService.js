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
    try {
      // Make sure taskId is a valid MongoDB _id string
      const response = await axios.delete(`/tasks/${taskId}`);
      console.log('Delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

const syncTask = async (task) => {
  await axios.post(`${API_URL}/calendar/events`, task);
};

export default { getTasks, getAuthUrl, addTask, deleteTask, syncTask };