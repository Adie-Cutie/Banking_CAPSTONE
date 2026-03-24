import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:3000/api' });

// Automatically attach JWT token to every request if it exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const fetchAccounts = () => API.get('/accounts/my-accounts');
export const transferMoney = (data) => API.post('/accounts/transfer', data);