import axios from 'axios';

// Change the port to 5001 if your backend is running there
const API = axios.create({ baseURL: 'http://localhost:3000/api' });

// This interceptor attaches the Token to every single request automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;