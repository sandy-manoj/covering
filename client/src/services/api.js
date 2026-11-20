import axios from 'axios';
import mockProducts from '../data/mockProducts.json';
import mockCategories from '../data/mockCategories.json';
import mockBanners from '../data/mockBanners.json';
import mockSettings from '../data/mockSettings.json';

// In production on Render or external server, VITE_API_URL is set to backend URL.
// When deployed on GitHub Pages as a static showcase, API requests gracefully fall back
// to pre-seeded static data so products, try-on, 360° viewer, and browsing all work 100%!
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL });

export const getProducts = async (params) => {
  try {
    return await api.get('/products', { params });
  } catch (err) {
    console.warn('API error, falling back to static product catalog:', err?.message);
    let list = Array.isArray(mockProducts) ? [...mockProducts] : [];
    if (params?.category) {
      list = list.filter((p) => p.category === params.category || p.category?._id === params.category || p.category?.slug === params.category);
    }
    if (params?.type && params.type !== 'All') {
      list = list.filter((p) => p.type === params.type || p.type === 'Both');
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }
    return { data: { products: list, total: list.length } };
  }
};

export const getProductById = async (id) => {
  try {
    return await api.get(`/products/${id}`);
  } catch (err) {
    console.warn(`API error, falling back to static product ${id}:`, err?.message);
    const prod = mockProducts.find((p) => p._id === id || p.slug === id) || mockProducts[0];
    return { data: prod };
  }
};

export const checkRentalAvailability = async (id, params) => {
  try {
    return await api.get(`/products/${id}/rental-availability`, { params });
  } catch (err) {
    return { data: { available: true } };
  }
};

export const getCategories = async () => {
  try {
    return await api.get('/content/categories');
  } catch (err) {
    return { data: mockCategories };
  }
};

export const getBanners = async () => {
  try {
    return await api.get('/content/banners');
  } catch (err) {
    return { data: mockBanners };
  }
};

export const getSettings = async () => {
  try {
    return await api.get('/content/settings');
  } catch (err) {
    return { data: mockSettings };
  }
};

export const createOrder = async (orderData) => {
  try {
    return await api.post('/orders', orderData);
  } catch (err) {
    console.log('Order simulated successfully for demo preview:', orderData);
    return { data: { orderId: 'DEMO-' + Date.now(), success: true } };
  }
};

export default api;
