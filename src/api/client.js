import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const STORAGE_KEY = "askScholarAuth";

const client = axios.create({ baseURL: API_BASE_URL });

// Attach the current session's JWT (admin or user) to every request.
client.interceptors.request.use((config) => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      /* ignore malformed storage */
    }
  }
  return config;
});

// Normalize error messages so components can just read err.message.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || "Something went wrong.";
    return Promise.reject(new Error(message));
  }
);

export default client;
