import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

const adminAccount = {
    username: process.env.REACT_APP_ADMIN_USERNAME || 'admin',
    password: process.env.REACT_APP_ADMIN_PASSWORD || 'ecommerceApp',
};

api.interceptors.request.use((config) => {
    const method = (config.method || 'get').toLowerCase();
    const path = (config.url || '').split('?')[0];
    const writesProduct = ['post', 'put', 'delete'].includes(method)
        && /^\/products(?:\/\d+)?\/?$/.test(path);

    if (writesProduct) {
        config.auth = adminAccount;
    }

    return config;
});

export default api;
