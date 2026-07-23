import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URI,
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
    failedQueue.forEach((p) => {
        if (error) p.reject(error);
        else p.resolve();
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isUnauthorized = error.response?.status === 401;
        const isRetry = originalRequest._retry;

        const url = `${originalRequest.baseURL || ""}${originalRequest.url || ""}`;

        const isAuthRoute =
            url.includes("/login") ||
            url.includes("/register") ||
            url.includes("/refresh")

        if (isUnauthorized && !isRetry && !isAuthRoute) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => api(originalRequest));
            }

            isRefreshing = true;

            try {
                await api.post("/api/v1/refresh");
                processQueue(null);
                return api(originalRequest);
            } catch (err) {
                processQueue(err);
                toast.error("Sessão expirada. Por favor, faça login novamente.");
                window.location.href = "/login";
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;