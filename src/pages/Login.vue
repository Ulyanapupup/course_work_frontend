<template>
  <!-- СТРАНИЦА ВХОДА В СИСТЕМУ (LOGIN) -->
  <!-- Пользователь вводит логин и пароль, отправляет запрос на сервер -->
  <!-- Получает JWT токен и сохраняет его в localStorage -->
  <!-- После успешного входа перенаправляется на главную страницу (Кошелёк) -->
  <div class="login-page">
    <div class="login-card">
      <h1>Вход в систему</h1>
      
      <!-- Форма входа -->
      <form @submit.prevent="handleLogin">
        <!-- Поле ввода имени пользователя -->
        <input 
          v-model="form.username" 
          type="text" 
          placeholder="Имя пользователя"
          required
        />
        <!-- Поле ввода пароля -->
        <input 
          v-model="form.password" 
          type="password" 
          placeholder="Пароль"
          required
        />
        <!-- Кнопка отправки формы -->
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Вход...' : 'Войти' }}
        </button>
      </form>
      
      <!-- Ссылка на страницу регистрации для новых пользователей -->
      <p class="register-link">
        Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue' // для реактивных переменных
import { useRouter } from 'vue-router' // перенаправления
import apiClient from '../api/axios.js' // настроенный HTTP-клиент (с интерсепторами)

/* ---------------------------
   РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ
----------------------------*/

// Экземпляр роутера для перенаправления после входа
const router = useRouter()
// Флаг загрузки
const isLoading = ref(false)
// Данные формы (логин и пароль)
const form = ref({ username: '', password: '' })

/* ---------------------------
   ФУНКЦИИ ОБРАБОТКИ ВХОДА
----------------------------*/

// Отправляет логин и пароль на сервер
// 1. Блокировка кнопки и показ текста "Вход..."
// 2. Отправка POST-запроса на сервер с логином и паролем
// 3. Получение JWT токена из ответа
// 4. Сохранение токена в localStorage
// 5. Перезагрузка страницы (чтобы обновить состояние навигации)
// 6. При ошибке — показ сообщения пользователю
// 7. Разблокировка кнопки
async function handleLogin() {
  isLoading.value = true // Блокируем кнопку
  try {
    const response = await apiClient.post('/auth/login', { // отправляем запрос
      username: form.value.username,
      password: form.value.password
    })
    const token = response.data.token // получаем токен
    localStorage.setItem('token', token) // сохраняем токен в localStorage
    // Принудительно обновляем страницу, чтобы Navbar перепроверил токен
    window.location.href = '/'
  } catch (error) {
    // Обработка ошибки входа
    alert(error.response?.data?.message || 'Ошибка входа')
  } finally {
    // В любом случае снимаем флаг загрузки (кнопка снова активна)
    isLoading.value = false
  }
}
</script>

/* ОСНОВНОЙ КОНТЕЙНЕР СТРАНИЦЫ */
<style scoped>
.login-page {
  min-height: 100vh;  /* Минимальная высота на весь экран */
  background: radial-gradient(circle at top, #928a82, #665b55);
  display: flex;               /* Flexbox для центрирования */
  justify-content: center;
  align-items: center;
}

/* Карточка вхожа */
.login-card {
  background: rgba(255,255,255,0.95);
  padding: 40px;
  border-radius: 20px;
  width: 350px;
  text-align: center;
}

/* Заголовок входа */
.login-card h1 {
  margin-bottom: 30px;
  color: #333;
  line-height: 50px;
}

/* Поля ввода (логин и пароль) */
.login-card input {
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 20px;
  box-sizing: border-box;
}

/* Кнопка входа */
.login-card button {
  width: 100%;
  padding: 12px;
  background: #4c7fdf;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  margin-top: 10px;
}

/* Эффект при наведении на кнопку */
.login-card button:hover {
  background: #3a6bc4;
}

/* Ссылка на регистрацию */
.register-link {
  margin-top: 20px;
  color: #666;
}

/* Стиль самой ссылки */
.register-link a {
  color: #4c7fdf;
  text-decoration: none;
}
</style>