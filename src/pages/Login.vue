<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Вход в систему</h1>
      
      <form @submit.prevent="handleLogin">
        <input 
          v-model="form.username" 
          type="text" 
          placeholder="Имя пользователя"
          required
        />
        <input 
          v-model="form.password" 
          type="password" 
          placeholder="Пароль"
          required
        />
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Вход...' : 'Войти' }}
        </button>
      </form>
      
      <p class="register-link">
        Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../api/axios.js'

const router = useRouter()
const isLoading = ref(false)
const form = ref({ username: '', password: '' })

async function handleLogin() {
  isLoading.value = true // Блокируем кнопку
  try {
    const response = await apiClient.post('/auth/login', { // Отправляем запрос
      username: form.value.username,
      password: form.value.password
    })
    const token = response.data.token // Получаем токен
    localStorage.setItem('token', token) // Сохраняем в localStorage
    // Принудительно обновляем страницу, чтобы Navbar перепроверил токен
    window.location.href = '/'
  } catch (error) {
    alert(error.response?.data?.message || 'Ошибка входа')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: radial-gradient(circle at top, #928a82, #665b55);
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-card {
  background: rgba(255,255,255,0.95);
  padding: 40px;
  border-radius: 20px;
  width: 350px;
  text-align: center;
}
.login-card h1 {
  margin-bottom: 30px;
  color: #333;
  line-height: 50px;
}
.login-card input {
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 20px;
  box-sizing: border-box;
}
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
.login-card button:hover {
  background: #3a6bc4;
}
.register-link {
  margin-top: 20px;
  color: #666;
}
.register-link a {
  color: #4c7fdf;
  text-decoration: none;
}
</style>