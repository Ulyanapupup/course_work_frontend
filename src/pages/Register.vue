<template>
  <div class="register-page">
    <div class="register-card">
      <h1>Регистрация</h1>
      
      <form @submit.prevent="handleRegister">
        <input 
          v-model="form.username" 
          type="text" 
          placeholder="Имя пользователя"
          required
        />
        <input 
          v-model="form.password" 
          type="password" 
          placeholder="Пароль (мин. 5 символов)"
          required
        />
        <input 
          v-model="form.confirmPassword" 
          type="password" 
          placeholder="Подтвердите пароль"
          required
        />
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
      </form>
      
      <p class="login-link">
        Уже есть аккаунт? <router-link to="/login">Войти</router-link>
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
const form = ref({ username: '', password: '', confirmPassword: '' })

async function handleRegister() {
  // Проверяем ,совпадают ли пароль и подтверждение
  if (form.value.password !== form.value.confirmPassword) {
    alert('Пароли не совпадают')
    return
  }
  
  // Проверяем длину пароля
  if (form.value.password.length < 5) {
    alert('Пароль должен быть не менее 5 символов')
    return
  }
  
  isLoading.value = true // Блокируем кнопки
  try {
    await apiClient.post('/auth/register', {
      username: form.value.username,
      password: form.value.password
    })
    alert('Регистрация успешна! Теперь войдите в систему')
    router.push('/login') // Перенаправляем на страницу входа
  } catch (error) {
    alert(error.response?.data?.message || 'Ошибка регистрации')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: radial-gradient(circle at top, #928a82, #665b55);
  display: flex;
  justify-content: center;
  align-items: center;
}
.register-card {
  background: rgba(255,255,255,0.95);
  padding: 40px;
  border-radius: 20px;
  width: 350px;
  text-align: center;
}
.register-card h1 {
  margin-bottom: 30px;
  color: #333;
}
.register-card input {
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}
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
.register-card button:hover {
  background: #45a049;
}
.login-link {
  margin-top: 20px;
  color: #666;
}
.login-link a {
  color: #4CAF50;
  text-decoration: none;
}
</style>