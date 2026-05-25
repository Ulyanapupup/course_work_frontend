<template>
  <!-- 
    Шапка приложения. Показывается ТОЛЬКО если пользователь авторизован.
    v-if="isAuthenticated" — если false, весь блок не отображается
  -->
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
// Импортируем необходимые модули
import { ref, onMounted } from 'vue'      // ref — реактивная переменная, onMounted — хук жизненного цикла
import { useRouter } from 'vue-router'   // useRouter — для программной навигации (перенаправление)
import { jwtDecode } from 'jwt-decode'   // функция для расшифровки JWT токена

// Создаём экземпляр роутера для перенаправления
const router = useRouter()

// Реактивные переменные
const isAuthenticated = ref(false)   // авторизован ли пользователь (по умолчанию false)
const username = ref('')             // имя пользователя (пустое по умолчанию)

// Хук жизненного цикла — вызывается после монтирования компонента (когда компонент отрисовался)
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

/* Шапка сайта — гибкий контейнер с элементами по краям */
.header {
  display: flex;                /* включаем flex-верстку */
  justify-content: space-between; /* элементы прижимаются к левому и правому краю */
  align-items: center;          /* выравнивание по вертикали по центру */
  padding: 10px 30px;           /* внутренние отступы: сверху/снизу 10px, слева/справа 30px */
  background: #fffdf6;          /* цвет фона шапки */
  border-bottom: 2px solid #f3ead7; /* нижняя граница (линия под шапкой) */
}

/* Панель навигации — ссылки в ряд */
.navbar {
  display: flex;                /* ссылки выстраиваются в строку */
  gap: 16px;                    /* расстояние между ссылками */
}

/* Стили для каждой ссылки в навигации */
.navbar a {
  text-decoration: none;        /* убираем подчёркивание */
  color: #ffffff;               /* цвет текста белый */
  background: #66432cc7;        /* фон: коричневый с прозрачностью (c7 ≈ 78% непрозрачности) */
  padding: 12px 28px;           /* внутренние отступы */
  border-radius: 18px;          /* скругление углов */
  font-size: 18px;              /* размер шрифта */
  font-weight: 700;             /* жирность шрифта (bold) */
  transition: 0.2s;             /* плавная анимация при наведении */
}

/* Эффект при наведении курсора на ссылку */
.navbar a:hover {
  background: #5e4439;          /* более тёмный коричневый */
}

/* Активная ссылка (на той странице, где находимся) */
/* router-link-active добавляется автоматически Vue Router */
.navbar a.router-link-active {
  background: #4c7fdf;          /* синий фон — выделяем текущую страницу */
  color: #ffffff;               /* белый текст */
}

/* Блок с именем пользователя и кнопкой выхода */
.user-info {
  display: flex;                /* элементы в строку */
  align-items: center;          /* вертикальное выравнивание по центру */
  gap: 15px;                    /* расстояние между именем и кнопкой */
}

/* Имя пользователя */
.username {
  color: #66432c;               /* тёмно-коричневый цвет */
  font-weight: bold;            /* жирный шрифт */
  font-size: 18px;              /* размер текста */
}

/* Кнопка выхода */
.logout-btn {
  border: none;                 /* убираем стандартную рамку */
  background: #b42525;          /* красноватый фон */
  color: white;                 /* белый текст */
  padding: 12px 28px;           /* внутренние отступы */
  border-radius: 18px;          /* скругление углов */
  cursor: pointer;              /* меняем курсор на указатель (рука) */
  font-size: 18px;              /* размер шрифта */
  font-weight: 700;             /* жирный шрифт */
  transition: 0.2s;             /* плавная анимация при наведении */
}

/* Эффект при наведении на кнопку выхода */
.logout-btn:hover {
  background: #751919;          /* более тёмный красный */
}
</style>