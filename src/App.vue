<template>
  <div class="app">
    <!-- Панель навигации (отображается на всех страницах) -->
    <Navbar />
    <div class="content-wrapper">
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
// Импорт компонента навигации
import Navbar from './components/Navbar.vue'
</script>

<style>
html, body, #app {
  margin: 0;
  width: 100%;
  min-height: 100%;
}

body {
  margin: 0;
  padding: 0;
}

.content {
  overflow: hidden;
}

.app {
  min-height: 100vh;
}
</style>