import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

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
      const originalRequest = error.config as RetryConfig | undefined;

      if (axios.isAxiosError(error)) {
        // Normalize backend error message from ApiResponse envelope
        const apiData = error.response?.data as
          | { message?: string; error?: string }
          | undefined;
        if (apiData?.message) {
          error.message = apiData.message;
        } else if (apiData?.error) {
          error.message = apiData.error;
        }

        // Login failure: do not attempt session refresh or redirect
        if (originalRequest?.url?.includes("/auth/login")) {
          return Promise.reject(error);
        }

        // Session expired: try to use the refresh token
          if (error.response?.status === 401 && !originalRequest?._retry) {
            if (originalRequest) {
              originalRequest._retry = true;
            }
            const refreshToken = localStorage.getItem("refreshToken");

            // Do not attempt to refresh if we are already trying to refresh
              if (refreshToken && !originalRequest?.url?.includes("/auth/refresh")) {
                try {
                  const BASE =
                    import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

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

                    if (originalRequest) {
                      originalRequest.headers["Authorization"] =
                        `Bearer ${newAccessToken}`;
                      return axios(originalRequest);
                    }
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
                // No refresh token available or request is refresh-related: logout
                localStorage.removeItem("authToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
                return Promise.reject(error);
              }
            }
          }

          return Promise.reject(error);
        },
  );
};
