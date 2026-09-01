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

  // Normalize backend error messages and handle expired sessions via Refresh Token
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (axios.isAxiosError(error)) {
        // Session expired: try to use the refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshToken = localStorage.getItem("refreshToken");

          // Do not attempt to refresh if we are already trying to login or refresh
          if (
            refreshToken &&
            !originalRequest.url?.includes("/auth/refresh") &&
            !originalRequest.url?.includes("/auth/login")
          ) {
            try {
              const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
              
              // We use fetch here to completely bypass any axios interceptors and avoid loops
              const response = await fetch(`${BASE}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: refreshToken }),
              });

              const data = await response.json();

              if (response.ok && data.ok) {
                // Success: save new tokens and retry original request
                const newAccessToken = data.payload.accessToken;
                const newRefreshToken = data.payload.refreshToken;
                localStorage.setItem("authToken", newAccessToken);
                if (newRefreshToken) {
                  localStorage.setItem("refreshToken", newRefreshToken);
                }

                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                return axios(originalRequest);
              } else {
                throw new Error("Refresh token expired or invalid");
              }
            } catch (refreshError) {
              // Refresh failed: completely logout
              localStorage.removeItem("authToken");
              localStorage.removeItem("refreshToken");
              window.location.href = "/login";
              return Promise.reject(refreshError);
            }
          } else {
            // No refresh token available or request is already auth-related: logout
            localStorage.removeItem("authToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
            return Promise.reject(error);
          }
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
