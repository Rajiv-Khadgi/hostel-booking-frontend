import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api', 
    withCredentials: true, // Important for sending cookies
});

// Request interceptor to attach access token if needed ( cookies are used here , 
//  using bearer tokens in headers,  attach it here).
//  backend uses cookies, withCredentials: true handles the JWT if it's an HTTP-only cookie.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401s and token refresh
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401, we haven't already retried, and it's not the login/refresh endpoint
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/login' && !originalRequest.url?.includes('/register')) {
            originalRequest._retry = true;
            try {
                // Attempt to refresh the token. backend has an endpoint for this
                await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8081/api'}/refresh`, {}, {
                    withCredentials: true,
                });

                // If successful, retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, likely means the refresh token is expired or invalid
                // Set a user-friendly message before redirecting to login
                localStorage.setItem('sessionExpiredMessage', 'Your session has expired. Please log in again to continue.');
                window.dispatchEvent(new Event('unauthorized'));
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
