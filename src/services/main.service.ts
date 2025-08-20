import axios, { AxiosInstance, AxiosError } from "axios";
import { createMockAdapter } from "./mock.adapter";

const baseURL = import.meta.env.VITE_APP_API_URL || "http://localhost:8888";
const timeout = parseInt(import.meta.env.VITE_APP_TIMEOUT || "20000");

console.log('🔧 API Config:', { baseURL, timeout });

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Enable mock mode via env or default to true for live demo
const mockEnabled = (import.meta.env.VITE_APP_USE_MOCK ?? "true").toString() === "true";
if (mockEnabled) {
  axiosInstance.defaults.adapter = createMockAdapter();
  console.log("🧪 Mock API enabled");
}

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // ⚠️ Nếu lỗi 401 và chưa từng retry thì thử refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post(`${baseURL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = response.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        // Gắn access token mới vào request cũ và retry
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // ❌ Refresh token cũng hết hạn: xóa token và chuyển hướng login
        localStorage.clear();
        alert("Bạn đã hết phiên thao tác vui lòng đăng nhập lại");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // ❌ Trả lỗi ra nếu không phải 401 hoặc đã retry
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject({
      message: error.message || "Network error occurred",
      statusCode: error.response?.status || 500,
    });
  }
);

export default axiosInstance;
