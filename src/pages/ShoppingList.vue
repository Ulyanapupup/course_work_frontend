<template>
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

        <!-- НАЗВАНИЕ СПИСКА -->
        <div class="list-title">
          {{ shoppingList?.name }}
        </div>

        <!-- ВЕРХНИЕ КНОПКИ -->
        <div class="top-buttons">
          <img
            class="item-button"
            src="../assets/button-del.png"
            alt=""
            @click="deleteShoppingList"
          />
        </div>

        <!-- ПУНКТИР -->
        <div class="top-dashed-line"></div>

      </div>

      <!-- Середина чека -->
      <div class="receipt-middle">

        <!-- Товары -->
        <div
          v-for="(item, index) in items"
          :key="item.id"
          class="item-row"
          :class="{ done: item.done }"
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

          <div v-if="item.done" class="item-overlay"></div>

          <!-- Название товара -->
          <div class="item-name">
            {{ item.name }}
          </div>

          <!-- Кнопки -->
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
          <span class="date-label-display">
            {{ purchaseDate ? 'Дата похода:' : 'Дата похода не указана' }}
          </span>
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
        <h3 class="form-title">{{ editingItem ? 'Редактировать товар' : 'Добавить товар' }}</h3>
        
        <div class="form-group">
          <select v-model="itemForm.categoryId" class="glass-input" @change="onCategoryChange">
            <option :value="null" disabled>Выберите категорию</option>
            <option
              v-for="c in categories"
              :key="c.id"
              :value="c.id"
            >
              {{ c.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <input
            v-model="itemForm.name"
            placeholder="Название товара"
            class="glass-input"
            @keyup.enter="saveItem"
          />
        </div>

        <button @click="saveItem" class="glass-btn submit-btn">
          {{ editingItem ? 'Сохранить изменения' : 'Добавить' }}
        </button>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getList, deleteList as deleteListApi, updateList } from '../api/lists'
import { addItem as apiAddItem, updateItem, deleteItem as apiDeleteItem } from '../api/items'
import { getProductCategories } from '../api/categories'

const route = useRoute()
const router = useRouter()

const listId = route.params.id

const shoppingList = ref(null)
const items = ref([])
const purchaseDate = ref(null)
const tempPurchaseDate = ref('')
const isEditingDate = ref(false)
const categories = ref([])

const itemForm = ref({
  name: '',
  categoryId: null
})

const editingItem = ref(null)

onMounted(async () => {
  await loadData()
})

async function loadData() {
  try {
    const res = await getList(listId)
    shoppingList.value = res.data
    purchaseDate.value = res.data.purchaseDate || null
    items.value = Array.isArray(res.data.items) ? res.data.items : []

    const catRes = await getProductCategories()
    categories.value = catRes.data
    
  } catch (error) {
    alert('Ошибка загрузки данных')
  }
}

function resetForm() {
  itemForm.value = {
    name: '',
    categoryId: null
  }
  editingItem.value = null
}

function editItem(item) {
  editingItem.value = item
  itemForm.value = {
    name: item.name,
    categoryId: item.category?.id ? Number(item.category.id) : null
  }
}

function onCategoryChange(event) {
  const value = event.target.value
  itemForm.value.categoryId = value === 'null' || value === null || value === '' ? null : Number(value)
}

async function saveItem() {
  try {
    if (itemForm.value.categoryId === null || 
        itemForm.value.categoryId === undefined || 
        itemForm.value.categoryId === '' ||
        itemForm.value.categoryId === 'null') {
      alert('Пожалуйста, выберите категорию')
      return
    }
    
    if (!itemForm.value.name || !itemForm.value.name.trim()) {
      alert('Пожалуйста, введите название товара')
      return
    }

    const payload = {
      name: itemForm.value.name.trim(),
      categoryId: Number(itemForm.value.categoryId)
    }

    if (editingItem.value) {
      // Редактируем существующий товар
      const res = await updateItem(editingItem.value.id, payload)
      const index = items.value.findIndex(i => i.id === editingItem.value.id)
      if (index !== -1) {
        items.value[index] = res.data
      }
    } else {
      // Добавляем новый товар
      const res = await apiAddItem(listId, payload)
      items.value.unshift(res.data)
    }
    resetForm()
    
  } catch (error) {
    console.error('Ошибка при сохранении товара:', error)
    if (error.response?.status === 400 && error.response?.data) {
      const errors = error.response.data
      let errorMessage = ''
      if (errors.name) errorMessage += `Название: ${errors.name}\n`
      if (errors.category) errorMessage += `Категория: ${errors.category}\n`
      if (errors.categoryId) errorMessage += `Категория: ${errors.categoryId}\n`
      if (errors.message) errorMessage += errors.message
      if (!errorMessage) errorMessage = Object.values(errors).join('\n')
      alert(`Ошибка валидации:\n${errorMessage}`)
    } else if (error.response?.status === 500) {
      alert('Ошибка сервера. Проверьте корректность данных')
    } else {
      alert('Произошла ошибка при сохранении товара')
    }
  }
}

function startEditDate() {
  tempPurchaseDate.value = purchaseDate.value || ''
  isEditingDate.value = true
}

async function saveDate() {
  try {
    const updated = {
      ...shoppingList.value,
      purchaseDate: tempPurchaseDate.value || null
    }
    const res = await updateList(updated)
    shoppingList.value = res.data
    purchaseDate.value = res.data.purchaseDate || null
    isEditingDate.value = false
    tempPurchaseDate.value = ''
  } catch (error) {
    console.error('Ошибка при сохранении даты:', error)
    alert('Не удалось сохранить дату')
  }
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

async function deleteItem(index) {
  const item = items.value[index]
  
  if (confirm(`Удалить товар "${item.name}"?`)) {
    try {
      await apiDeleteItem(item.id)
      items.value.splice(index, 1)
    } catch (error) {
      console.error('Ошибка при удалении товара:', error)
      alert('Произошла ошибка при удалении товара')
    }
  }
}

async function deleteShoppingList() {
  const confirmed = confirm(`Удалить список "${shoppingList.value?.name}"?`)

  if (!confirmed) return

  try {
    await deleteListApi(listId)
    router.push('/lists')
  } catch (error) {
    console.error('Ошибка при удалении списка:', error)
    alert('Произошла ошибка при удалении списка')
  }
}

function getCategoryImage(categoryId) {
  const images = {
    28: '/src/assets/categories/28.png',
    29: '/src/assets/categories/29.png',
    30: '/src/assets/categories/30.png',
    31: '/src/assets/categories/31.png',
    32: '/src/assets/categories/32.png',
    33: '/src/assets/categories/33.png',
    34: '/src/assets/categories/34.png',
    35: '/src/assets/categories/35.png',
    36: '/src/assets/categories/36.png',
    37: '/src/assets/categories/37.png',
    38: '/src/assets/categories/38.png',
    39: '/src/assets/categories/39.png',
    40: '/src/assets/categories/40.png',
    41: '/src/assets/categories/41.png',
    42: '/src/assets/categories/42.png',
    43: '/src/assets/categories/43.png',
    44: '/src/assets/categories/44.png',
    45: '/src/assets/categories/45.png',
    46: '/src/assets/categories/46.png',
    47: '/src/assets/categories/47.png',
    48: '/src/assets/categories/48.png',
    49: '/src/assets/categories/49.png',
    50: '/src/assets/categories/50.png',
    51: '/src/assets/categories/51.png',
    52: '/src/assets/categories/52.png',
    53: '/src/assets/categories/53.png',
    54: '/src/assets/categories/54.png',
    55: '/src/assets/categories/55.png',
    56: '/src/assets/categories/56.png',
    57: '/src/assets/categories/57.png',
    58: '/src/assets/categories/58.png',
    59: '/src/assets/categories/59.png',
    60: '/src/assets/categories/60.png',
    61: '/src/assets/categories/61.png',
    62: '/src/assets/categories/62.png'
  }

  return images[categoryId] || '/src/assets/categories/0.png'
}
</script>

<style scoped>
.lists-page {
  min-height: 100vh;
  display: flex;
  justify-content: flex-start;
  gap: 40px;
  padding-top: 40px;
  padding-bottom: 100px;
  background: radial-gradient(circle at top, #928a82, #665b55);
  padding-left: 80px;
  padding-right: 80px;
}

/* ЧЕК */
.receipt-container {
  width: 850px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.receipt-top {
  width: 100%;
  display: block;
}

/* ВЕРХ ЧЕКА */
.receipt-top-wrapper {
  position: relative;
  width: 100%;
}

/* НАЗВАНИЕ СПИСКА */
.list-title {
  position: absolute;
  top: 110px;
  left: 8%;
  font-size: 45px;
  font-weight: bold;
  color: black;
  white-space: nowrap;
  z-index: 10;
}

/* ПУНКТИР */
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
  background-image: url('../assets/list.png');
  background-repeat: repeat-y;
  background-size: 100% auto;
  padding-left: 40px;
  padding-right: 40px;
  padding-top: 20px;
  padding-bottom: 10px;
  box-sizing: border-box;
  min-height: 220px;
}

.receipt-bottom {
  width: 100%;
  display: block;
}

/* ВЕРХНИЕ КНОПКИ */
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

/* СТЕКЛЯННЫЕ КАРТОЧКИ */
.glass-card {
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
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

/* Стеклянные инпуты */
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

.glass-input:focus {
  outline: none;
  border-color: #8ab9ff;
  background: white;
  box-shadow: 0 0 10px rgba(138, 185, 255, 0.5);
}

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

.save-date-img {
  width: 70px;
  cursor: pointer;
  transition: 0.2s;
  flex-shrink: 0;
}

.save-date-img:hover {
  transform: scale(1.05);
}

/* Кнопки в стеклянном стиле */
.glass-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 15px;
  font-size: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

.edit-date-img {
  width: 70px;
  cursor: pointer;
  transition: 0.2s;
  margin-left: auto;
}

.edit-date-img:hover {
  transform: scale(1.05);
}

.submit-btn {
  width: 100%;
  background: #76bdff;
  margin-top: 10px;
}

.submit-btn:hover {
  background: #4a91e2;
  transform: scale(1.02);
}

/* ДАТА ПОХОДА (отображение) */
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

.date-value {
  font-size: 18px;
  color: #2d426a;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 16px;
  border-radius: 12px;
}

/* ТОВАРЫ В ЧЕКЕ */
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

.item-name {
  flex: 1;
  color: black;
  font-size: 28px;
  font-weight: bold;
  max-width: 420px;
  white-space: normal;
  word-break: break-word;
  line-height: 1;
}

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

.item-category-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 20px;
}

.item-image-placeholder {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  border-radius: 20px;
}

.item-buttons {
  display: flex;
  flex-shrink: 0;
}

.item-button {
  width: 90px;
  cursor: pointer;
  transition: transform 0.2s;
}

.item-button:hover {
  transform: scale(1.05);
}
</style>