import axios from "axios";

export const setupAxiosInterceptors = () => {
  // Attach the Bearer token to every outgoing request
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

  // Normalize backend error messages and handle expired sessions
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error)) {
        // Session expired or invalid token: force logout
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Normalize backend error message from ApiResponse envelope
        if (error.response?.data?.error) {
          error.message = error.response.data.error;
        }
      }

      return Promise.reject(error);
    },
  );
};
