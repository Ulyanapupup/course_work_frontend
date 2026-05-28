<template>
<!-- Страница со списком покупок -->
  <div class="lists-page">
    <!-- ЧЕК -->
    <div class="receipt-container">

      <!-- Верх чека -->
      <div class="receipt-top-wrapper">

        <img
          class="receipt-top"
          src="../assets/list_top.png"
          alt=""
        >

        <!-- Название спсика -->
        <div class="list-title">
          {{ shoppingList?.name }}
        </div>

        <!-- Кнопка -->
        <div class="top-buttons">
          <img
            class="item-button"
            src="../assets/button-del.png"
            alt=""
            @click="deleteShoppingList"
          />
        </div>

        <!-- Пунктир -->
        <div class="top-dashed-line"></div>

      </div>

      <!-- Середина чека -->
      <!-- Фон повторяется по вертикали, блок автоматически растет при добавлении товаров -->
      <div class="receipt-middle">

        <!-- Все товары в списке -->
        <div
          v-for="(item, index) in items"
          :key="item.id"
          class="item-row"
        >
          <!-- Квадрат с картинкой категории -->
          <div class="item-image">
            <img
              class="item-category-image"
              :src="getCategoryImage(item.category?.id)"
              alt=""
              v-if="item.category?.id"
            />
            <div class="item-image-placeholder" v-else></div>
          </div>

          <!-- Название товара -->
          <div class="item-name">
            {{ item.name }}
          </div>

          <!-- Кнопки управления товарами -->
          <div class="item-buttons">
            <img
              class="item-button"
              src="../assets/button-edit.png"
              alt=""
              @click="editItem(item)"
            >

            <img
              class="item-button"
              src="../assets/button-del.png"
              alt=""
              @click="deleteItem(index)"
            >
          </div>
        </div>

      </div>

      <!-- Низ чека -->
      <img
        class="receipt-bottom"
        src="../assets/list_bottom.png"
        alt=""
      >

    </div>

    <!-- ПРАВАЯ ПАНЕЛЬ: ДАТА И ФОРМА ТОВАРОВ -->
    <div class="right-panel">
      
      <!-- ДАТА ПОХОДА (отображение) -->
      <div class="glass-card date-card" v-if="!isEditingDate">
        <div class="date-header">
          <!-- Подпись: указана дата или нет -->
          <span class="date-label-display">
            {{ purchaseDate ? 'Дата похода:' : 'Дата похода не указана' }}
          </span>
          <!-- Отформатированная дата (если есть) -->
          <span class="date-value" v-if="purchaseDate">
            {{ formatDate(purchaseDate) }}
          </span>
          <img 
            class="edit-date-img" 
            src="../assets/button-edit-white.png" 
            :alt="purchaseDate ? 'Изменить' : 'Добавить'" 
            @click="startEditDate"
          />
        </div>
      </div>

      <!-- ФОРМА РЕДАКТИРОВАНИЯ ДАТЫ -->
      <div class="glass-card date-card" v-if="isEditingDate">
        <div class="date-edit-row">
          <input 
            type="date" 
            v-model="tempPurchaseDate" 
            class="glass-input date-edit-input"
          />
          <!-- Кнопка сохранения даты -->
          <img 
            class="save-date-img" 
            src="../assets/button-ok-white.png" 
            alt="Сохранить" 
            @click="saveDate"
          />
        </div>
      </div>

      <!-- ФОРМА ДОБАВЛЕНИЯ/РЕДАКТИРОВАНИЯ ТОВАРА -->
      <div class="glass-card">

        <!-- Заголовок формы (меняется в зависимости от режима: добавление/редактирование) -->
        <h3 class="form-title">{{ editingItem ? 'Редактировать товар' : 'Добавить товар' }}</h3>
        
        <!-- ВЫБОР КАТЕГОРИИ ТОВАРА -->
        <div class="form-group">
          <select v-model="itemForm.categoryId" class="glass-input" @change="onCategoryChange">
            <option :value="null" disabled>Выберите категорию</option>
            <!-- Динамический список категорий из базы данных -->
            <option
              v-for="c in categories"
              :key="c.id"
              :value="c.id"
            >
              {{ c.name }}
            </option>
          </select>
        </div>

        <!-- ПОЛЕ ВВОДА НАЗВАНИЯ ТОВАРА -->
        <div class="form-group">
          <input
            v-model="itemForm.name"
            placeholder="Название товара"
            class="glass-input"
            @keyup.enter="saveItem"
          />
        </div>

        <!-- КНОПКА СОХРАНЕНИЯ (текст меняется в зависимости от режима) -->
        <button @click="saveItem" class="glass-btn submit-btn">
          {{ editingItem ? 'Сохранить изменения' : 'Добавить' }}
        </button>
      </div>

    </div>

  </div>
</template>

<script setup>
// Vue-функции для реактивности и жизненного цикла
import { ref, onMounted } from 'vue'
// Маршрутизация (получение параметров URL и навигация)
import { useRoute, useRouter } from 'vue-router'
// API-функции для работы со списками
import { getList, deleteList as deleteListApi, updateList } from '../api/lists'
// API-функции для работы с товарами
import { addItem as apiAddItem, updateItem, deleteItem as apiDeleteItem } from '../api/items'
// API-функция для получения категорий товаров (PRODUCT)
import { getProductCategories } from '../api/categories'

/* ---------------------------
   РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ
----------------------------*/

// Маршрутизация: получаем текущий маршрут и роутер
const route = useRoute()       // объект с информацией о текущем маршруте
const router = useRouter()     // для навигации (переход на другие страницы)

// ID списка из параметра URL
const listId = route.params.id

// Данные текущего списка (загружаются с сервера)
const shoppingList = ref(null)
// Список товаров
const items = ref([])
// Дата покупки
const purchaseDate = ref(null)
// Временная дата при редактировании
const tempPurchaseDate = ref('')
// Флаг: режим редактирования даты (true = показываем календарь, false = показываем дату)
const isEditingDate = ref(false)
// Список всех категорий товаров (PRODUCT) — загружается с сервера
const categories = ref([])

// Форма добавления/редактирования товара
const itemForm = ref({
  name: '',
  categoryId: null
})

// Редактируемый товар (если не null — значит в режиме редактирования)
const editingItem = ref(null)

/* ---------------------------
   ЖИЗНЕННЫЙ ЦИКЛ
----------------------------*/

onMounted(async () => {
  await loadData()
})

// Загрузка данных списка и категорий с сервера
async function loadData() {
  try {
    // Загружаем список по ID с сервера
    const res = await getList(listId)    // данные списка
    shoppingList.value = res.data        // дата покупки
    purchaseDate.value = res.data.purchaseDate || null
    // товары (защита от null)
    items.value = Array.isArray(res.data.items) ? res.data.items : []

    // Загружаем все категории товаров (PRODUCT)
    const catRes = await getProductCategories()
    categories.value = catRes.data
    
  } catch (error) {
    alert('Ошибка загрузки данных')
  }
}

/* ---------------------------
   ФУНКЦИИ УПРАВЛЕНИЯ ФОРМОЙ ТОВАРА
----------------------------*/

// Сбросить форму добавления товара
function resetForm() {
  itemForm.value = {
    name: '',
    categoryId: null
  }
  editingItem.value = null
}

// Начать редактирование товара
// Заполняет форму данными выбранного товара
function editItem(item) {
  editingItem.value = item
  itemForm.value = {
    name: item.name,
    categoryId: item.category?.id ? Number(item.category.id) : null
  }
}

// Обработчик изменения выбранной категории в выпадающем списке
// Преобразует значение из строки в число (сервер ожидает число)
function onCategoryChange(event) {
  const value = event.target.value
  itemForm.value.categoryId = value === 'null' || value === null || value === '' ? null : Number(value)
}

// Сохранить товар (добавить новый или обновить существующий)
// Отправляет данные на сервер и обновляет локальный список
async function saveItem() {
  try {
    // ВАЛИДАЦИЯ: проверяем, что категория выбрана
    if (itemForm.value.categoryId === null || 
        itemForm.value.categoryId === undefined || 
        itemForm.value.categoryId === '' ||
        itemForm.value.categoryId === 'null') {
      alert('Пожалуйста, выберите категорию')
      return
    }
    
    // ВАЛИДАЦИЯ: проверяем, что название товара не пустое
    if (!itemForm.value.name || !itemForm.value.name.trim()) {
      alert('Пожалуйста, введите название товара')
      return
    }

    // Формируем данные для отправки на сервер
    const payload = {
      name: itemForm.value.name.trim(),
      categoryId: Number(itemForm.value.categoryId)
    }

    // Если редактируем существующий товар
    if (editingItem.value) {
      // Отправляем запрос на обновление
      const res = await updateItem(editingItem.value.id, payload)
      // Находим индекс товара в локальном массиве и заменяем
      const index = items.value.findIndex(i => i.id === editingItem.value.id)
      if (index !== -1) {
        items.value[index] = res.data
      }
    // Иначе добавляем новый товар
    } else {
      // Отправляем запрос на создание
      const res = await apiAddItem(listId, payload)
      // Добавляем в начало списка (новый товар сверху)
      items.value.unshift(res.data)
    }

    // Очищаем форму и выходим из режима редактирования
    resetForm()
    
  } catch (error) {
    // Обработка ошибок с сервера
    console.error('Ошибка при сохранении товара:', error)
    // Если сервер вернул ошибку валидации (400)
    if (error.response?.status === 400 && error.response?.data) {
      const errors = error.response.data
      let errorMessage = ''
      if (errors.name) errorMessage += `Название: ${errors.name}\n`
      if (errors.category) errorMessage += `Категория: ${errors.category}\n`
      if (errors.categoryId) errorMessage += `Категория: ${errors.categoryId}\n`
      if (errors.message) errorMessage += errors.message
      if (!errorMessage) errorMessage = Object.values(errors).join('\n')
      alert(`Ошибка валидации:\n${errorMessage}`)
    // Ошибка сервера (500)
    } else if (error.response?.status === 500) {
      alert('Ошибка сервера. Проверьте корректность данных')
    // Остальные ошибки
    } else {
      alert('Произошла ошибка при сохранении товара')
    }
  }
}

/* ---------------------------
   ФУНКЦИИ УПРАВЛЕНИЯ ДАТОЙ ПОКУПКИ
----------------------------*/

// Начать редактирование даты
// Копируем текущую дату во временное поле и включаем режим редактирования
function startEditDate() {
  tempPurchaseDate.value = purchaseDate.value || ''
  isEditingDate.value = true
}

// Сохранить выбранную дату на сервере
// Отправляем обновлённую дату и закрываем режим редактирования
async function saveDate() {
  try {
    // Обновляем объект списка с новой датой
    const updated = {
      ...shoppingList.value,
      purchaseDate: tempPurchaseDate.value || null
    }
    // Отправляем запрос на сервер
    const res = await updateList(updated)

    // Обновляем локальные данные
    shoppingList.value = res.data
    purchaseDate.value = res.data.purchaseDate || null
    isEditingDate.value = false
    tempPurchaseDate.value = ''
  } catch (error) {
    console.error('Ошибка при сохранении даты:', error)
    alert('Не удалось сохранить дату')
  }
}

// Форматирование даты для отображения на русском языке
function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/* ---------------------------
   ФУНКЦИИ УДАЛЕНИЯ
----------------------------*/

// Удалить товар из списка
async function deleteItem(index) {
  const item = items.value[index]
  
  // Подтверждение удаления
  if (confirm(`Удалить товар "${item.name}"?`)) {
    try {
      // Удаляем на сервере
      await apiDeleteItem(item.id)
      // Удаляем из локального массива
      items.value.splice(index, 1)
    } catch (error) {
      console.error('Ошибка при удалении товара:', error)
      alert('Произошла ошибка при удалении товара')
    }
  }
}

// Удалить весь список покупок
// После удаления перенаправляет на страницу всех списков
async function deleteShoppingList() {
  // Подтверждение удаления
  const confirmed = confirm(`Удалить список "${shoppingList.value?.name}"?`)

  if (!confirmed) return

  try {
    // Удаляем на сервере
    await deleteListApi(listId)
    // Возвращаемся на страницу всех списков
    router.push('/lists')
  } catch (error) {
    console.error('Ошибка при удалении списка:', error)
    alert('Произошла ошибка при удалении списка')
  }
}

// Получить путь к изображению категории по её ID
function getCategoryImage(categoryId) {
  const images = {
    29: '/src/assets/categories/28.png',
    30: '/src/assets/categories/29.png',
    31: '/src/assets/categories/30.png',
    32: '/src/assets/categories/31.png',
    33: '/src/assets/categories/32.png',
    34: '/src/assets/categories/33.png',
    35: '/src/assets/categories/34.png',
    36: '/src/assets/categories/35.png',
    37: '/src/assets/categories/36.png',
    38: '/src/assets/categories/37.png',
    39: '/src/assets/categories/38.png',
    40: '/src/assets/categories/39.png',
    41: '/src/assets/categories/40.png',
    42: '/src/assets/categories/41.png',
    43: '/src/assets/categories/42.png',
    44: '/src/assets/categories/43.png',
    45: '/src/assets/categories/44.png',
    46: '/src/assets/categories/45.png',
    47: '/src/assets/categories/46.png',
    48: '/src/assets/categories/47.png',
    49: '/src/assets/categories/48.png',
    50: '/src/assets/categories/49.png',
    51: '/src/assets/categories/50.png',
    52: '/src/assets/categories/51.png',
    53: '/src/assets/categories/52.png',
    54: '/src/assets/categories/53.png',
    55: '/src/assets/categories/54.png',
    56: '/src/assets/categories/55.png',
    57: '/src/assets/categories/56.png',
    58: '/src/assets/categories/57.png',
    59: '/src/assets/categories/58.png',
    60: '/src/assets/categories/59.png',
    61: '/src/assets/categories/60.png',
    62: '/src/assets/categories/61.png',
    63: '/src/assets/categories/62.png'
  }

  return images[categoryId] || '/src/assets/categories/0.png'
}
</script>

<style scoped>
/* ОСНОВНОЙ КОНТЕЙНЕР СТРАНИЦЫ */
.lists-page {
  min-height: 100vh;                /* Минимальная высота на весь экран */
  display: flex;                    /* Flexbox для расположения чека и панели в ряд */
  justify-content: flex-start;      /* Прижимаем содержимое к левому краю */
  gap: 40px;                        /* Расстояние между чеком и правой панелью */
  padding-top: 40px;
  padding-bottom: 100px;
  background: radial-gradient(circle at top, #928a82, #665b55);
  padding-left: 80px;
  padding-right: 80px;
}

/* КОНТЕЙНЕР ЧЕКА */
.receipt-container {
  width: 850px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;  /* Запрещаем сжатие */
}

/* Изображение верхней части чека */
.receipt-top {
  width: 100%;
  display: block;
}

/* Верх чека */
.receipt-top-wrapper {
  position: relative;
  width: 100%;
}

/* Название списка */
.list-title {
  position: absolute;
  top: 110px;
  left: 8%;
  font-size: 45px;
  font-weight: bold;
  color: black;
  white-space: nowrap;  /* Текст в одну строку */
  z-index: 10;
}

/* Пунктрир */
.top-dashed-line {
  position: absolute;
  left: 40px;
  right: 40px;
  bottom: 18px;
  border-bottom: 3px dashed rgba(0,0,0,0.25);
}

/* Середина чека */
.receipt-middle {
  width: 100%;
  background-image: url('../assets/list.png');  /* Фон с текстурой чека */
  background-repeat: repeat-y;                  /* Повторяется по вертикали */
  background-size: 100% auto;
  padding-left: 40px;
  padding-right: 40px;
  padding-top: 20px;
  padding-bottom: 10px;
  box-sizing: border-box;
  min-height: 220px;
}

/* Низ чека */
.receipt-bottom {
  width: 100%;
  display: block;
}

/* Верхние кнопки */
.top-buttons {
  position: absolute;
  top: 90px;
  right: 50px;
  display: flex;
  gap: 0px;
  z-index: 10;
}

/* ПРАВАЯ ПАНЕЛЬ */
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 25px;
  width: 550px;
  margin-top: 100px;
  margin-left: 90px;
}

/* Стекляные карточки */
.glass-card {
  background: rgba(0, 0, 0, 0.25);    /* Полупрозрачный тёмный фон */
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  padding: 25px;
  transition: 0.3s;
}

/* Карточка даты - меньшей ширины */
.date-card {
  width: 380px;
  padding: 15px 20px;
}

/* Заголовок формы */
.form-title {
  font-size: 29px;
  font-weight: bold;
  color: white;
  margin-bottom: 30px;
  text-align: center;
}

/* Группа полей */
.form-group {
  margin-bottom: 20px;
}

/* Стеклянные поля ввода */
.glass-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  font-size: 19px;
  color: #333;
  transition: 0.2s;
  box-sizing: border-box;
}

/* Эффект при фокусе на поле */
.glass-input:focus {
  outline: none;
  border-color: #8ab9ff;
  background: white;
  box-shadow: 0 0 10px rgba(138, 185, 255, 0.5);
}

/* Стиль для option внутри select */
.glass-input option {
  background: white;
  color: #333;
}

/* Строка редактирования даты - кнопка рядом с полем */
.date-edit-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.date-edit-input {
  flex: 1;
  margin-bottom: 0;
}

/* Кнопка сохранения даты */
.save-date-img {
  width: 70px;
  cursor: pointer;
  transition: 0.2s;
  flex-shrink: 0;
}

.save-date-img:hover {
  transform: scale(1.05);
}

/* Кнопки */
.glass-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 15px;
  font-size: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

/* Кнопка редактирования даты */
.edit-date-img {
  width: 70px;
  cursor: pointer;
  transition: 0.2s;
  margin-left: auto;
}

.edit-date-img:hover {
  transform: scale(1.05);
}

/* Кнопка отправки формы */
.submit-btn {
  width: 100%;
  background: #76bdff;
  margin-top: 10px;
}

.submit-btn:hover {
  background: #4a91e2;
  transform: scale(1.02);
}

/* Блок отображения даты (шапка с датой) */
.date-header {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.date-label-display {
  font-size: 18px;
  font-weight: bold;
  color: white;
}

/* Само значение даты */
.date-value {
  font-size: 18px;
  color: #2d426a;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 16px;
  border-radius: 12px;
}

/* Товары в чеке (одна строка товара) */
.item-row {
  display: flex;
  position: relative;
  align-items: center;
  gap: 50px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px dashed rgba(0,0,0,0.2);
  transition: opacity 0.3s;
}

/* Название товара */
.item-name {
  flex: 1;
  color: black;
  font-size: 28px;
  font-weight: bold;
  max-width: 420px;
  white-space: normal;       /* Текст может переноситься */
  word-break: break-word;    /* Перенос длинных слов */
  line-height: 1;
}

/* Квадрат с иконкой категории */
.item-image {
  position: relative;
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 27, 85, 0.31);
  overflow: hidden;
  left: 30px;
}

/* Изображение категории внутри квадрата */
.item-category-image {
  width: 100%;
  height: 100%;
  object-fit: contain;  /* Сохраняем пропорции */
  border-radius: 20px;
}

/* Заглушка, если нет изображения */
.item-image-placeholder {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  border-radius: 20px;
}

/* Контейнер с кнопками управления товаром */
.item-buttons {
  display: flex;
  flex-shrink: 0;
}

/* Кнопки товара (редактировать, удалить) */
.item-button {
  width: 90px;
  cursor: pointer;
  transition: transform 0.2s;
}

.item-button:hover {
  transform: scale(1.05);
}
</style>