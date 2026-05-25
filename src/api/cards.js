import apiClient from './axios.js';

export const getCards = () => apiClient.get('/cards');
export const createCard = (card) => apiClient.post('/cards', card);
export const updateCard = (card) => apiClient.put(`/cards/${card.id}`, card);
export const deleteCard = (id) => apiClient.delete(`/cards/${id}`);
export const addCashback = (cardId, cashback) => apiClient.post(`/cards/${cardId}/cashbacks`, cashback);
export const updateCashback = (cashbackId, cashback) => apiClient.put(`/cards/cashbacks/${cashbackId}`, cashback);
export const deleteCashback = (cashbackId) => apiClient.delete(`/cards/cashbacks/${cashbackId}`);