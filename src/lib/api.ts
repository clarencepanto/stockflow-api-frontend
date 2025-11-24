import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if:
    // 1. It's a 401
    // 2. We actually HAD a token (meaning session expired)
    // 3. We're NOT already on the login page
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        const isLoginPage = window.location.pathname === "/auth/login";

        // Only redirect if we had a token AND we're not on login page
        if (token && !isLoginPage) {
          localStorage.removeItem("token");
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
