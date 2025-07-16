"use client";
import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { Accept: "application/json" },
});

let isRefreshing = false;
let failedRequestsQueue = [];

const processQueue = (error, token = null) => {
  failedRequestsQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedRequestsQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get("refreshToken");

      if (!refreshToken) {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        console.warn("No refresh token found. Redirecting to login...");
        window.location.pathname = "/sign-in";

        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            resolve: (token) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject: (error) => reject(error),
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await axiosInstance.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
          {
            oldRefreshToken: refreshToken,
          }
        );
        if (res.status == 200) {
          Cookies.set("accessToken", res.data.accessToken, { expires: 1 });
          Cookies.set("refreshToken", res.data.refreshToken, { expires: 7 });
          axiosInstance.defaults.headers[
            "Authorization"
          ] = `Bearer ${res.data.accessToken}`;
          processQueue(null, res.data.accessToken);
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${res.data.accessToken}`;

          return axiosInstance(originalRequest);
        } else {
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          console.warn("Token refresh failed. Redirecting to login...");
          window.location.pathname = "/sign-in";

          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        console.error("Token refresh failed:", refreshError);
        window.location.pathname = "/sign-in";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
