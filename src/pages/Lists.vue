<template>
  <!-- СТРАНИЦА СО СПИСКАМИ ПОКУПОК -->

  <!-- Динамическая высота страницы (зависит от количества списков) -->
  <div
      class="lists-page"
      :style="{ minHeight: pageHeight + 'vh' }"
  >

    <!-- КНОПКА ДОБАВЛЕНИЯ НОВОГО СПИСКА -->
    <div class="add-list-button-wrapper">
      <button class="add-list-btn" @click="addList">
        Добавить список покупок
      </button>
    </div>

    <!-- СЕТКА СО СПИСКАМИ (3 колонки) -->
    <div class="lists-grid">

      <!-- Перебираем все списки в обратном порядке (reversedLists) -->
      <!-- Новые списки появляются в начале (слева сверху) -->
      <div
        v-for="(list, index) in reversedLists"
        :key="list.id"
        class="list-wrapper"
      >

        <!-- ФОНОВОЕ ИЗОБРАЖЕНИЕ СПИСКА (стилизованная карточка) -->
        <img
          class="list-image"
          src="../assets/list-one.png"
          alt=""
        >

        <!-- НАЗВАНИЕ СПИСКА (с возможностью редактирования) -->
        <div class="list-title">

          <!-- Если режим редактирования - показываем поле ввода -->
          <input
            v-if="list.isEditing"
            v-model="list.tempName"
            class="list-input"
            @keyup.enter="saveEdit(list)"
          />
          <!-- Иначе - просто текст -->
          <div v-else>
            {{ list.name }}
          </div>
        </div>

        <!-- КНОПКИ УПРАВЛЕНИЯ СПИСКОМ -->
        <div class="list-buttons">

          <!-- EDIT -->
          <img
            v-if="!list.isEditing"
            class="list-button"
            src="../assets/button-edit.png"
            alt=""
            @click="startEdit(list)"
          />

          <!-- OK -->
          <img
            v-else
            class="list-button"
            src="../assets/button-ok.png"
            alt=""
            @click="saveEdit(list)"
          />

          <!-- OPEN -->
          <img
            class="list-button"
            src="../assets/button-open.png"
            alt=""
            @click="openList(list.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getLists, createList, updateList } from '../api/lists'
import { useRouter } from 'vue-router'

// Настрйока роутера
const router = useRouter()

// Переход на страницу выбранного списка (с товарами)
function openList(id) {
  router.push(`/shopping-list/${id}`)
}

// Список всех списков покупок (загрузка с сервера)
const lists = ref([])

/* ---------------------------
   ЖИЗНЕННЫЙ ЦИКЛ
----------------------------*/

onMounted(async () => {
  // Загружаем все списки пользователя с сервера
  const res = await getLists()

  // Добавляем каждому списку служебные поля для редактирования
  lists.value = res.data.map(list => ({
    ...list,
    isEditing: false, // режим редактирования названия
    tempName: '' // временное имя при редактировании
  }))
})

/* ---------------------------
   ФУНКЦИИ УПРАВЛЕНИЯ СПИСКАМИ
----------------------------*/

// Добавить новый список покупок
async function addList() {
  // Создаём объект нового списка с автоматическим названием (пустой)
  const newList = {
    name: `Список покупок ${lists.value.length + 1}`,
    items: []
  }

  // Отправляем запрос на сервер
  const res = await createList(newList)

  // Добавляем новый список в локальный массив
  lists.value.push({
    ...res.data,
    isEditing: false,
    tempName: ''
  })
}

// Начать редактирование названия списка
function startEdit(list) {
  list.isEditing = true
  list.tempName = list.name // копируем текущее имя во временное поле
}

// Сохранить отредактированное название списка
async function saveEdit(list) {
  const newName = list.tempName.trim()

  // Если имя пустое — просто выходим из режима редактирования
  if (newName.length === 0) {
    list.isEditing = false
    return
  }

  // Формируем обновлённый объект списка
  const updated = {
    ...list,
    name: newName
  }

  try {
    // Отправляем запрос на сервер
    const res = await updateList(updated)
    // Обновляем локальные данные
    list.name = res.data.name
    list.isEditing = false

  } catch (error) {
    console.error('Ошибка при сохранении списка:', error)
    // Обработка ошибок валидации с сервера
    if (error.response?.status === 400 && error.response?.data) {
      const errors = error.response.data
      const errorMessages = Object.values(errors).join('\n')
      alert(`Ошибка валидации:\n${errorMessages}`)
    } else {
      alert('Ошибка при сохранении списка')
    }
  }
}

/* ---------------------------
   ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
----------------------------*/

// Списки в обратном порядке (новые списки появляются сверху/слева)
// Т.к. массив пополняется в конец, при отображении в обратном порядке
// новые списки будут первыми
const reversedLists = computed(() => {
  return [...lists.value].reverse()
})

// Динамическая высота страницы
// Базовое количество строк = ceil(количество списков / 3)
// Высота = 90vh + (количество строк сверх 2) * 20vh
// Минимум 92vh (чтобы сетка не обрезалась)
const pageHeight = computed(() => {
  // Количество строк (до 3 списков)
  const rows = Math.ceil(lists.value.length / 3)
  // +20vh за каждую лишнюю строку, минимум 92vh
  return Math.max(92, 90 + (rows - 2) * 20)
})
</script>

<style scoped>
/* ОСНОВНОЙ КОНТЕЙНЕР СТРАНИЦЫ */
.lists-page {
  width: 100%;
  background: radial-gradient(circle at top, #928a82, #665b55);
  padding-top: 60px;
  padding-bottom: 80px;
  box-sizing: border-box;
}

/* Контейнер для кнопки */
.add-list-button-wrapper {
  margin-top: -20px;
  margin-left: 40px;
  margin-bottom: 30px;
  text-align: left;
}

/* Стиль кнопки добавления */
.add-list-btn {
  background: #598eff;
  color: white;
  border: none;
  padding: 14px 32px;
  font-size: 28px;
  font-weight: bold;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Эффект при наведении */
.add-list-btn:hover {
  transform: scale(1.02);
  background: #3278e0;
}

/* Эффект при нажатии */
.add-list-btn:active {
  transform: scale(0.98);
}

/* СЕТКА СО СПИСКОМ (3 колонки) */
.lists-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* 3 равные колонки */
  gap: 50px;                              /* Расстояние между карточками */
  justify-items: center;                  /* Центрирование по горизонтали */
  width: 100%;
  padding-left: 40px;
  padding-right: 40px;
  box-sizing: border-box;
}

/* КАРТОЧКА ОДНОГО СПИСКА */
.list-wrapper {
  position: relative;
  width: 480px;
  transition: 0.2s;
  filter: drop-shadow(0 12px 22px rgba(0,0,0,0.15));  /* Тень */
}

/* Эффект при наведении на карточку */
.list-wrapper:hover {
  transform: translateY(-5px);
}

/* ФОНОВОЕ ИЗОБРАЖЕНИЕ КАРТОЧКИ */
.list-image {
  width: 100%;
  display: block;
}

/* НАЗВАНИЕ СПИСКА */
.list-title {
  position: absolute;
  top: 65px;
  left: 40px;
  color: black;
  font-size: 35px;
  font-weight: bold;
}

/* Поле ввода при редактировании названия */
.list-input {
  font-size: 35px;
  font-weight: bold;
  border: 2px solid rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  margin-left: -78px;
  margin-top: -18px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.4);
  color: black;
  width: 80%;
  transition: 0.2s;
}

/* Кнопки управления списком */
.list-buttons {
  position: absolute;
  bottom: 40px;
  right: 250px;
  display: flex;
  gap: 10px;
}

/* Кнопки управления */
.list-button {
  width: 90px;
  cursor: pointer;
  transition: 0.2s;
}

/* Эффект при наведении на кнопку */
.list-button:hover {
    transform: scale(1.1);
}

</style>