// Импортируем библиотеку axios
import axios from 'axios';

// Настроенный экземпляр axios
const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',  // Базовый адрес — прибавляется к каждому запросу
    withCredentials: true,                  // Разрешаем отправку куки (для кросс-доменных запросов)
});

// Интерсептор: добавляем токен в каждый запрос
apiClient.interceptors.request.use((config) => {
    // config — объект с настройками запроса (URL, заголовки и т.д.)
    
    // Не добавляем токен для auth запросов (логин, регистрация)
    if (config.url.includes('/auth/')) {
        return config;   // возвращаем запрос без изменений
    }
    
    // Для всех остальных запросов — добавляем токен
    const token = localStorage.getItem('token');   // достаём токен из хранилища
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;  // добавляем заголовок
    }
    return config;   // возвращаем изменённый запрос
});

// Интерсептор: обработка ошибок
apiClient.interceptors.response.use(
    // Первый параметр — если запрос успешен, просто возвращаем ответ
    (response) => response,
    
    // Второй параметр — если произошла ошибка
    (error) => {
        // Проверяем, был ли это запрос к auth-эндпоинту
        const isAuthRequest = error.config?.url?.includes('/auth/');
        
        // Если ошибка 401 (Unauthorized) И это НЕ auth запрос
        if (!isAuthRequest && error.response?.status === 401) {
            localStorage.removeItem('token');        // удаляем испорченный токен
            window.location.href = '/login';         // отправляем на страницу входа
        }
        
        // Пробрасываем ошибку дальше, чтобы компонент мог её обработать
        return Promise.reject(error);
    }
);

export default apiClient;