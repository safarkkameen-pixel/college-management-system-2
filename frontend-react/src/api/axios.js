import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Automatically attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('cms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Automatically handle 401 (session expired)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cms_token');
      localStorage.removeItem('cms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;