import axios from 'axios';

const DEFAULT_API_URL = import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://suvidha-sdi1.onrender.com/api';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || DEFAULT_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
