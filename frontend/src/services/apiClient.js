import axios from "axios";

// Use Vite-compatible environment variable
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000", // Use Vite environment variables
  timeout: 20000, // 10 seconds timeout
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// Optional: Add interceptors
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Request [${config.method.toUpperCase()}] => ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
