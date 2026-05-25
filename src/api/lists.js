import apiClient from './axios.js';

export const getLists = () => apiClient.get('/lists');
export const createList = (list) => apiClient.post('/lists', list);
export const updateList = (list) => apiClient.put(`/lists/${list.id}`, list);
export const deleteList = (id) => apiClient.delete(`/lists/${id}`);
export const getList = (id) => apiClient.get(`/lists/${id}`);