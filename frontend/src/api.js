import axios from "axios";

// Set VITE_API_URL in a .env file (see .env.example) to point this at your
// backend. Falls back to localhost for local development.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
