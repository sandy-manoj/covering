import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gold_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const adminLogin = (creds) => api.post('/admin/login', creds);
export const getAdminProfile = () => api.get('/admin/me');
export const changePassword = (data) => api.put('/admin/change-password', data);

// Products CRUD
export const getAdminProducts = (params) => api.get('/products', { params: { ...params, limit: 100 } });
export const getAdminProductById = (id) => api.get(`/products/${id}`);
export const createAdminProduct = (data) => api.post('/products', data);
export const updateAdminProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteAdminProduct = (id) => api.delete(`/products/${id}`);

// Categories
export const getAdminCategories = () => api.get('/content/admin/categories');
export const createAdminCategory = (data) => api.post('/content/categories', data);
export const updateAdminCategory = (id, data) => api.put(`/content/categories/${id}`, data);
export const deleteAdminCategory = (id) => api.delete(`/content/categories/${id}`);

// Orders & Dashboard Stats
export const getDashboardStats = () => api.get('/orders/dashboard-stats');
export const getAdminOrders = (params) => api.get('/orders', { params });
export const updateOrderStatus = (id, data) => api.put(`/orders/${id}/status`, data);

// Rentals
export const getAdminRentals = (params) => api.get('/rentals', { params });
export const updateRentalStatus = (id, data) => api.put(`/rentals/${id}/status`, data);

// Banners & Settings
export const getAdminBanners = () => api.get('/content/admin/banners');
export const createAdminBanner = (data) => api.post('/content/banners', data);
export const deleteAdminBanner = (id) => api.delete(`/content/banners/${id}`);
export const getAdminSettings = () => api.get('/content/settings');
export const updateAdminSettings = (data) => api.put('/content/settings', data);

// File Upload
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/content/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export default api;
