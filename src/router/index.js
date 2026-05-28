import { createRouter, createWebHistory } from "vue-router"
import Wallet from '../pages/Wallet.vue'
import Lists from '../pages/Lists.vue'
import ShoppingList from '../pages/ShoppingList.vue'
import Analytics from '../pages/Analytics.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'

// Функция проверки аутентификации
// Проверяет, есть ли JWT токен в localStorage браузера
// Преобразует значение в boolean: если токен есть → true, если нет → false
const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}

// Массив маршрутов приложения
const routes = [
    // Гостевые страницы (только для неавторизованных)
    { 
      path: '/login',           // URL-адрес
      component: Login,         // Какой компонент показывать
      meta: { requiresGuest: true }   // Требуется, чтобы пользователь НЕ был авторизован
    },
    { 
      path: '/register', 
      component: Register, 
      meta: { requiresGuest: true }
    },
    
    // Защищённые страницы (только для авторизованных)
    { 
      path: '/',                // Главная страница (Кошелёк)
      component: Wallet, 
      meta: { requiresAuth: true }     // Требуется авторизация
    },
    { 
      path: '/lists',           // Страница со списками покупок
      component: Lists, 
      meta: { requiresAuth: true }
    },
    { 
      path: '/shopping-list/:id',      // Детальная страница конкретного списка
      component: ShoppingList,         // :id — динамический параметр (ID списка)
      meta: { requiresAuth: true }
    },
    { 
      path: '/analytics',       // Страница аналитики
      component: Analytics, 
      meta: { requiresAuth: true }
    }
]

// Экземпляр роутера
const router = createRouter({
    history: createWebHistory(),   // HTML5 History API (красивые URL без #)
    routes
})

// Глобальная защита маршрутов (срабатывает перед каждым переходом)
router.beforeEach((to, from) => {
    // to — куда переходим (целевой маршрут)
    // from — откуда переходим (предыдущий маршрут)
    
    const authenticated = isAuthenticated()   // Проверяем, залогинен ли пользователь
    
    // Если страница требует авторизации, а пользователь не залогинен
    if (to.meta.requiresAuth && !authenticated) {
        return '/login'        // Перенаправляем на страницу входа
    } 
    // Если страница для гостей (логин/регистрация), а пользователь уже залогинен
    else if (to.meta.requiresGuest && authenticated) {
        return '/'             // Перенаправляем на главную страницу (Кошелёк)
    }
    
    // Во всех остальных случаях — разрешаем переход
    return true
})

export default router