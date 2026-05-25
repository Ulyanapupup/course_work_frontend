import apiClient from './axios.js';

export const addItem = (listId, item) => apiClient.post(`/items/${listId}`, item);
export const updateItem = (id, item) => apiClient.put(`/items/${id}`, item);
export const deleteItem = (id) => apiClient.delete(`/items/${id}`);