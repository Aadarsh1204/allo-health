import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-4699.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;