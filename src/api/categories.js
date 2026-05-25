import apiClient from './axios.js';

export const getCashbackCategories = () => apiClient.get('/categories/cashback');
export const getProductCategories = () => apiClient.get('/categories/product');