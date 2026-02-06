import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Secret API for analytics
export const secretApi = axios.create({
    baseURL: 'http://localhost:5000/api/secret',
    headers: {
        'X-INTERNAL-SECURITY-TOKEN': 'project-secret-v1-2026',
        'Content-Type': 'application/json'
    }
});

// Adding an interceptor to handle 404s (which we use for unauthorized access)
secretApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 404) {
            console.error('Secret route access denied or not found.');
        }
        return Promise.reject(error);
    }
);

export default api;
