<template>
  <!-- СТРАНИЦА РЕГИСТРАЦИИ НОВОГО ПОЛЬЗОВАТЕЛЯ (REGISTER) -->
  <!-- После успешной регистрации перенаправляем на страницу входа -->
  <div class="register-page">
    <div class="register-card">
      <h1>Регистрация</h1>
      
      !-- Форма регистрации -->
      <form @submit.prevent="handleRegister">

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
          placeholder="Пароль (мин. 5 символов)"
          required
        />

        <!-- Поле подтверждения пароля с проверкой -->
        <input 
          v-model="form.confirmPassword" 
          type="password" 
          placeholder="Подтвердите пароль"
          required
        />

        <!-- Кнопка отправки формы -->
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
      </form>
      
      <!-- Ссылка на страницу входа для уже зарегистрированных пользователей -->
      <p class="login-link">
        Уже есть аккаунт? <router-link to="/login">Войти</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue' // для реактивных переменных
import { useRouter } from 'vue-router' // перенаправления
import apiClient from '../api/axios.js' // настроенный HTTP-клиент

/* ---------------------------
   РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ
----------------------------*/

// Экземпляр роутера для перенаправления после регистрации
const router = useRouter()
// Флаг загрузки
const isLoading = ref(false)
// Данные формы
const form = ref({ username: '', password: '', confirmPassword: '' })

/* ---------------------------
   ФУНКЦИИ ОБРАБОТКИ РЕГИСТРАЦИИ
----------------------------*/

// Отправляет данные нового пользователя на сервер
// 1. Клиентская валидация (совпадение паролей, длина пароля)
// 2. Блокировка кнопки и показ текста "Регистрация..."
// 3. Отправка POST-запроса на сервер
// 4. При успехе — показ сообщения и перенаправление на страницу входа
// 5. При ошибке — показ сообщения пользователю
// 6. Разблокировка кнопки
async function handleRegister() {
  // Проверяем, совпадают ли пароль и подтверждение
  if (form.value.password !== form.value.confirmPassword) {
    alert('Пароли не совпадают')
    return
  }
  
  // Проверяем длину пароля
  if (form.value.password.length < 5) {
    alert('Пароль должен быть не менее 5 символов')
    return
  }
  
  // ОТПРАВКА НА СЕРВЕР
  isLoading.value = true // Блокируем кнопку
  try {
    // Пароль будет зашифрован на сервере с помощью BCrypt
    await apiClient.post('/auth/register', { // запрос на сервер
      username: form.value.username,
      password: form.value.password
    })
    alert('Регистрация успешна! Теперь войдите в систему')
    router.push('/login') // перенаправляем на страницу входа

  } catch (error) {
    // Обработка ошибки регистрации
    alert(error.response?.data?.message || 'Ошибка регистрации')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* ОСНОВНОЙ КОНТЕЙНЕР СТРАНИЦЫ */
.register-page {
  min-height: 100vh;  /* Минимальная высота на весь экран */
  background: radial-gradient(circle at top, #928a82, #665b55);
  display: flex;      /* Flexbox для центрирования */
  justify-content: center;
  align-items: center;
}

/* Карточка регистрации */
.register-card {
  background: rgba(255,255,255,0.95);
  padding: 40px;
  border-radius: 20px;
  width: 350px;
  text-align: center;
}

/* Заголовок регистрации */
.register-card h1 {
  margin-bottom: 30px;
  color: #333;
}

/* Поля ввода */
.register-card input {
  width: 100%;  /* Растягиваем на всю ширину карточки */
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}

/* Кнопка регистрации */
.register-card button {
  width: 100%;
  padding: 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

/* Эффект при наведении на кнопку */
.register-card button:hover {
  background: #45a049;
}

/* Ссылка на вход */
.login-link {
  margin-top: 20px;
  color: #666;
}

/* Стиль самой ссылки */
.login-link a {
  color: #4CAF50;
  text-decoration: none;
}
</style>