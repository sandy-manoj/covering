import axios from 'axios';

// In production on Render, VITE_API_URL is set to the backend service URL.
// In local dev, Vite proxy forwards /api to localhost:5000 so we use a relative path.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL });

export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const checkRentalAvailability = (id, params) => api.get(`/products/${id}/rental-availability`, { params });
export const getCategories = () => api.get('/content/categories');
export const getBanners = () => api.get('/content/banners');
export const getSettings = () => api.get('/content/settings');
export const createOrder = (orderData) => api.post('/orders', orderData);

export default api;
