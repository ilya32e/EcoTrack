import axios, { AxiosError } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: false
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log errors for debugging
    if (error.response?.status === 401) {
      console.error("Unauthorized - token may be invalid or expired");
    } else if (error.response?.status === 403) {
      console.error("Forbidden - insufficient permissions");
    } else if (error.response?.status === 404) {
      console.error("Not found - endpoint or resource doesn't exist");
    } else if (error.response?.status === 422) {
      // Validation error - show details
      const data = error.response?.data as any;
      console.error("Validation error (422):", data?.detail || data);
      if (data?.detail && Array.isArray(data.detail)) {
        data.detail.forEach((err: any) => {
          console.error(`  Field ${err.loc?.join(".")}: ${err.msg}`);
        });
      }
    } else if (error.message === 'Network Error') {
      console.error("Network error - API server may not be running");
    }
    return Promise.reject(error);
  }
);

