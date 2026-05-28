<template>
  <!-- Шапка приложения. Показывается ТОЛЬКО если пользователь авторизован. -->
  <header class="header" v-if="isAuthenticated">
    
    <!-- Панель навигации со ссылками на основные страницы -->
    <nav class="navbar">
      <!-- router-link — это ссылка Vue Router, работает без перезагрузки страницы -->
      <router-link to="/">Кошелек</router-link>
      <router-link to="/lists">Списки</router-link>
      <router-link to="/analytics">Аналитика</router-link>
    </nav>

    <!-- Блок с информацией о пользователе и кнопкой выхода -->
    <div class="user-info">
      <!-- Отображаем имя пользователя (из decoded токена) -->
      <span class="username">{{ username }}</span>
      <!-- Кнопка выхода, при клике вызывает confirmLogout -->
      <button class="logout-btn" @click="confirmLogout">Выйти</button>
    </div>
    
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'      // ref — реактивная переменная, onMounted — хук жизненного цикла
import { useRouter } from 'vue-router'   // useRouter — перенаправление
import { jwtDecode } from 'jwt-decode'   // функция для расшифровки JWT токена

// Экземпляр роутера для перенаправления
const router = useRouter()

const isAuthenticated = ref(false)   // авторизован ли пользователь (по умолчанию false)
const username = ref('')             // имя пользователя (пустое по умолчанию)

onMounted(() => {
  checkAuth()   // при загрузке компонента проверяем авторизацию
})

// Функция проверки авторизации
function checkAuth() {
  const token = localStorage.getItem('token')   // достаём токен из хранилища браузера
  
  if (token) {   // если токен существует
    try {
      const decoded = jwtDecode(token)          // расшифровываем токен, чтобы получить данные
      isAuthenticated.value = true              // устанавливаем флаг авторизации в true
      username.value = decoded.sub              // sub — стандартное поле JWT, содержит имя пользователя
    } catch (e) {
      // Если токен испорчен или невалиден — удаляем его
      localStorage.removeItem('token')
    }
  }
}

// Функция выхода из системы
function confirmLogout() {
  // Показываем диалог подтверждения
  if (confirm('Вы действительно хотите выйти из системы?')) {
    localStorage.removeItem('token')            // удаляем токен из хранилища
    isAuthenticated.value = false               // сбрасываем флаг авторизации
    router.push('/login')                       // перенаправляем на страницу входа
  }
}
</script>

<style scoped>

/* Шапка сайта */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 30px;
  background: #fffdf6;
  border-bottom: 2px solid #f3ead7;
}

/* Панель навигации — ссылки в ряд */
.navbar {
  display: flex;
  gap: 16px;
}

/* Стили для каждой ссылки в навигации */
.navbar a {
  text-decoration: none;
  color: #ffffff;
  background: #66432cc7;
  padding: 12px 28px;
  border-radius: 18px;
  font-size: 18px;
  font-weight: 700;
  transition: 0.2s;
}

/* Эффект при наведении курсора на ссылку */
.navbar a:hover {
  background: #5e4439;
}

/* Активная ссылка (на той странице, где находимся) */
/* router-link-active добавляется автоматически Vue Router */
.navbar a.router-link-active {
  background: #4c7fdf;
  color: #ffffff;
}

/* Блок с именем пользователя и кнопкой выхода */
.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* Имя пользователя */
.username {
  color: #66432c;
  font-weight: bold;
  font-size: 18px;
}

/* Кнопка выхода */
.logout-btn {
  border: none;
  background: #b42525;
  color: white;
  padding: 12px 28px;
  border-radius: 18px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  transition: 0.2s;
}

/* Эффект при наведении на кнопку выхода */
.logout-btn:hover {
  background: #751919;
}
</style>