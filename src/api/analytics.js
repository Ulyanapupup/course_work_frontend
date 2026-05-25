import apiClient from './axios.js';

// Анализ списков покупок
export const analyzeShoppingLists = async (listIds) => {
    return await apiClient.post('/analytics/analyze', { listIds })
}

// Сохранение отчета
export const saveAnalyticsReport = async (reportData) => {
    return await apiClient.post('/analytics/reports', reportData)
}

// Получение всех сохраненных отчетов
export const getAnalyticsReports = async () => {
    return await apiClient.get('/analytics/reports')
}

// Получение конкретного отчета
export const getAnalyticsReport = async (reportId) => {
    return await apiClient.get(`/analytics/reports/${reportId}`)
}

// Удаление отчета
export const deleteAnalyticsReport = async (reportId) => {
    return await apiClient.delete(`/analytics/reports/${reportId}`)
}