import axios from 'axios';

const api = axios.create({
  baseURL: 'https://shopappbackend-nl1h.onrender.com/api', // 🔹 שנה לכתובת ה-API שלך
  headers: { 'Content-Type': 'application/json' },
});

export default api;
