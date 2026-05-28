<template>
  <!-- СТРАНИЦА АНАЛИТИКИ -->
  <div class="analytics-page">
    <div class="analytics-container">
      
      <!-- ВЫБОР СПИСКА ДЛЯ АНАЛИЗА -->
      <div class="selection-panel">
        <h2 class="panel-title">Выбор списка для анализа</h2>
        
        <!-- Радио-кнопки для выбора списка -->
        <div class="lists-radio">
          <label 
            v-for="list in lists" 
            :key="list.id" 
            class="list-radio"
          >
            <!-- Радио-кнопка -->
            <input 
              type="radio" 
              :value="list.id" 
              v-model="selectedListId"
            >
            <!-- Название списка -->
            <span>{{ list.name }}</span>
            <!-- Дата покупки (если указана) -->
            <span v-if="list.purchaseDate" class="list-date-badge">
              {{ formatDateOnly(list.purchaseDate) }}
            </span>
          </label>
        </div>

        <!-- Кнопка запуска анализа -->
        <div class="panel-buttons">
          <button 
            class="analyze-button" 
            @click="analyze" 
            :disabled="!selectedListId || isLoading"
          >
            {{ isLoading ? 'Анализируем...' : 'Анализировать' }}
          </button>
        </div>
      </div>

      <!-- СПИСОК СОХРАНЕННЫХ ОТЧЕТОВ -->
      <div class="reports-panel" v-if="savedReports.length > 0">
        <h2 class="panel-title">Сохраненные отчеты</h2>
        
        <div class="reports-list">
          <div 
            v-for="report in savedReports" 
            :key="report.id" 
            class="report-item"
          >
            <!-- Клик по отчёту — открыть его -->
            <div class="report-info" @click="openReport(report)">
              <div class="report-name">{{ report.name }}</div>
            </div>
            
            <!-- Кнопка удаления отчёта -->
            <div class="report-actions">
              <img 
                class="delete-report-img" 
                src="../assets/button-del.png" 
                alt="Удалить" 
                @click="deleteReport(report.id)"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- ОТОБРАЖЕНИЕ РЕЗУЛЬТАТОВ -->
      <div class="results-panel" v-if="currentReport">
        <!-- Шапка результатов -->
        <div class="results-header">
          <div class="results-title">
            <h2 class="panel-title">Результат анализа</h2>

            <!-- Информация о дате покупки (влияет на особые кешбэки) -->
            <div class="purchase-date-info" v-if="currentReport.purchaseDate">
              Дата похода: {{ formatDateOnly(currentReport.purchaseDate) }}
            </div>

            <div class="purchase-date-info warning" v-else>
              Дата похода не указана (особые кешбэки не учитывались)
            </div>
          </div>

          <div class="results-actions">
            <!-- Кнопка сохранения отчёта (показывается только для новых отчётов) -->
            <button v-if="!currentReport.id" class="save-report-btn" @click="saveReport">
              Сохранить отчет
            </button>

            <!-- Кнопка закрытия отчёта -->
            <img 
              class="close-report-img" 
              src="../assets/button-close.png" 
              alt="Закрыть" 
              @click="closeReport"
            >
          </div>
        </div>

        <!-- ГРУППИРОВКА ТОВАРОВ ПО КАРТАМ И ПРОЦЕНТАМ -->
        <div 
          v-for="(group, index) in groupedResults" 
          :key="index" 
          class="category-group"
        >
          <!-- Заголовок группы (название карты и процент) -->
          <div class="category-group-header">
            <span class="category-name">{{ group.displayName }}</span>
          </div>
          
          <div class="category-items">
            <!-- Товары в этой группе -->
            <div 
              v-for="item in group.items" 
              :key="item.itemName" 
              class="result-item"
              :class="{ purchased: item.purchased }"
            >
              <!-- Чекбокс для отметки покупки (только для сохранённых отчётов) -->
              <div class="purchase-check" v-if="currentReport.id">
                <input 
                  type="checkbox" 
                  v-model="item.purchased"
                  @change="savePurchasedStatus"
                >

              <!-- Информация о товаре -->
              </div>
              <div class="item-info">
                <div class="item-name">{{ item.itemName }}</div>
                <div class="item-category">{{ item.categoryName }}</div>
                
                <!-- conditionDesc: для активных особых кешбэков или пояснение для баллов -->
                <div v-if="item.conditionDesc" class="condition-desc">
                  {{ item.conditionDesc }}
                </div>
                
                <!-- futureSpecialAdvice: для будущих особых кешбэков -->
                <div v-if="item.futureSpecialAdvice" class="special-advice">
                  {{ item.futureSpecialAdvice }}
                </div>
              </div>

              <!-- Информация о кешбэке (если есть) -->
              <div class="cashback-info" v-if="item.percent > 0">
                <div class="card-name">{{ item.cardName }}</div>
                <div class="percent">{{ item.percent }}%</div>
              </div>

              <div class="no-cashback" v-else>
                Нет кешбэка
              </div>
            </div>
          </div>
        </div>

        <!-- ГРУППА ТОВАРОВ БЕЗ КЕШБЭКА -->
        <div v-if="noCashbackItems.length > 0" class="category-group no-cashback-group">
          <div class="category-group-header">
            <span class="category-name">Без кешбэка</span>
          </div>
          <div class="category-items">
            <div 
              v-for="item in noCashbackItems" 
              :key="item.itemName" 
              class="result-item"
              :class="{ purchased: item.purchased }"
            >

              <!-- Чекбокс для отметки покупки -->
              <div class="purchase-check" v-if="currentReport.id">
                <input 
                  type="checkbox" 
                  v-model="item.purchased"
                  @change="savePurchasedStatus"
                >
              </div>

              <!-- Информация о товаре -->
              <div class="item-info">
                <div class="item-name">{{ item.itemName }}</div>
                <div class="item-category">{{ item.categoryName }}</div>
                <div v-if="item.conditionDesc" class="condition-desc">
                  {{ item.conditionDesc }}
                </div>
                <div v-if="item.futureSpecialAdvice" class="special-advice">
                  {{ item.futureSpecialAdvice }}
                </div>
              </div>

              <div class="no-cashback">
                Нет подходящей карты
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
// API для работы со списками и аналитикой
import { getLists } from '../api/lists'
import { analyzeShoppingLists, saveAnalyticsReport, getAnalyticsReports, deleteAnalyticsReport } from '../api/analytics'

/* ---------------------------
   РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ
----------------------------*/

// Список всех списков покупок пользователя
const lists = ref([])
// ID выбранного списка для анализа
const selectedListId = ref(null)
// Флаг загрузки
const isLoading = ref(false)
// Текущий отчёт
const currentReport = ref(null)
// Список сохранённых отчётов (загружается с сервера)
const savedReports = ref([])

/* ---------------------------
   ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
----------------------------*/

// Группировка товаров с кешбэком по картам и процентам
const groupedResults = computed(() => {
  if (!currentReport.value?.results) return []
  
  const groups = new Map() // Используем Map для уникальных групп
  
  currentReport.value.results.forEach(item => {
    // Только товары, у которых есть кешбэк (процент > 0)
    if (item.percent > 0) {
      // Уникальный ключ группы: карта + процент + категория
      const key = `${item.cardName}_${item.percent}_${item.categoryName || 'кешбэк'}`
      if (!groups.has(key)) {
        groups.set(key, {
          displayName: `${item.cardName}\n${item.percent}% ${item.categoryName || 'кешбэк'}`,
          items: [],
          percent: item.percent,
          cardName: item.cardName
        })
      }
      groups.get(key).items.push(item)
    }
  })
  
  // Сортируем группы по убыванию процента
  const sortedGroups = Array.from(groups.values())
    .sort((a, b) => b.percent - a.percent)
  
  return sortedGroups
})

// Товары без кешбэка
const noCashbackItems = computed(() => {
  if (!currentReport.value?.results) return []
  return currentReport.value.results.filter(item => item.percent === 0 || !item.percent)
})

/* ---------------------------
   ЖИЗНЕННЫЙ ЦИКЛ
----------------------------*/

onMounted(async () => {
  await loadLists() // Загружаем все списки покупок
  await loadSavedReports() // Загружаем сохранённые отчёты
})

/* ---------------------------
   ФУНКЦИИ ЗАГРУЗКИ ДАННЫХ
----------------------------*/

// Загрузить все списки покупок пользователя
async function loadLists() {
  try {
    const res = await getLists()
    lists.value = res.data
  } catch (error) {
    console.error('Ошибка загрузки списков:', error)
  }
}

// Загрузить все сохранённые отчёты пользователя
async function loadSavedReports() {
  try {
    const res = await getAnalyticsReports()
    savedReports.value = res.data
  } catch (error) {
    console.error('Ошибка загрузки отчетов:', error)
  }
}

/* ---------------------------
   ФУНКЦИИ ФОРМАТИРОВАНИЯ ДАТ
----------------------------*/

// Форматирование даты для отображения
function formatDateOnly(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Форматирование даты для названия отчёта
function formatDateForTitle(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Генерация автоматического названия для отчёта
// Формат: "Название списка (дата похода: ...) — текущая дата"
function generateReportName(listName, purchaseDate) {
  const today = new Date()
  const todayStr = formatDateForTitle(today)
  
  let name = `${listName}`
  if (purchaseDate) {
    name += ` (дата похода: ${formatDateOnly(purchaseDate)})`
  }
  name += ` — ${todayStr}`
  return name
}

/* ---------------------------
   ФУНКЦИЯ АНАЛИЗА
----------------------------*/

// Запустить анализ выбранного списка
// Отправляет запрос на сервер, получает результаты и отображает их
async function analyze() {
  if (!selectedListId.value) return // ничего не выбрано
  
  isLoading.value = true
  
  try {
    // Находим выбранный список по ID
    const selectedList = lists.value.find(l => l.id === selectedListId.value)
    // Отправляем запрос на сервер
    const res = await analyzeShoppingLists([selectedListId.value])
    // Генерируем автоматическое название для отчёта
    const autoName = generateReportName(selectedList?.name, selectedList?.purchaseDate)
    // Добавляем каждому товару поле purchased (отмечен ли как купленный) — пока false
    const resultsWithPurchased = res.data.map(item => ({
      ...item,
      purchased: false
    }))
    
    // Создаём объект текущего отчёта (без ID — ещё не сохранён)
    currentReport.value = {
      id: null,
      name: autoName,
      results: resultsWithPurchased,
      createdAt: new Date(),
      listName: selectedList?.name,
      purchaseDate: selectedList?.purchaseDate
    }
  } catch (error) {
    console.error('Ошибка анализа:', error)
    alert('Произошла ошибка при анализе')
  } finally {
    isLoading.value = false
  }
}

/* ---------------------------
   ФУНКЦИИ ДЛЯ РАБОТЫ С СОХРАНЕННЫМИ ОТЧЕТАМИ
----------------------------*/

// Сохранить текущий отчёт на сервер
async function saveReport() {
  if (!currentReport.value) return
  
  try {
    const selectedList = lists.value.find(l => l.id === selectedListId.value)
    if (!selectedList) return
    
    // Убираем поле purchased перед отправкой на сервер (оно нужно только для локального хранения)
    const resultsForSave = currentReport.value.results.map(({ purchased, ...item }) => item)
    
    // Данные для сохранения
    const reportData = {
      name: currentReport.value.name,
      results: resultsForSave,
      selectedListIds: [selectedListId.value],
      listName: selectedList.name,
      purchaseDate: selectedList.purchaseDate || null
    }
    
    // Отправляем на сервер
    const res = await saveAnalyticsReport(reportData)
    // Обновляем ID текущего отчёта (теперь он сохранён)
    currentReport.value.id = res.data.id
    // Загружаем статусы покупок из localStorage
    loadPurchasedStatus()
    // Обновляем список сохранённых отчётов
    await loadSavedReports()
  } catch (error) {
    console.error('Ошибка сохранения отчета:', error)
    alert('Ошибка при сохранении отчета')
  }
}

// Открыть сохранённый отчёт
function openReport(report) {
  // Добавляем каждому товару поле purchased (пока false, потом загрузим из localStorage)
  const resultsWithPurchased = (report.results || []).map(item => ({
    ...item,
    purchased: false
  }))
  
  currentReport.value = {
    ...report,
    results: resultsWithPurchased
  }

  // Восстанавливаем ID выбранного списка (если сохранили)
  selectedListId.value = report.selectedListIds?.[0] || null
  // Загружаем статусы покупок из localStorage
  loadPurchasedStatus()
}

// Удалить отчёт
async function deleteReport(reportId) {
  if (confirm('Удалить этот отчет?')) {
    try {
      // Удаляем на сервере
      await deleteAnalyticsReport(reportId)
      // Обновляем список сохранённых отчётов
      await loadSavedReports()

      // Если удалили текущий открытый отчёт — закрываем его
      if (currentReport.value?.id === reportId) {
        currentReport.value = null
      }

      // Удаляем статусы покупок из localStorage
      localStorage.removeItem(`purchased_${reportId}`)
    } catch (error) {
      console.error('Ошибка удаления отчета:', error)
      alert('Ошибка при удалении отчета')
    }
  }
}

// Закрыть текущий отчёт (вернуться к выбору списка)
function closeReport() {
  currentReport.value = null
  selectedListId.value = null
}

/* ---------------------------
   ФУНКЦИИ ДЛЯ РАБОТЫ СО СТАТУСАМИ ПОКУПОК (localStorage)
----------------------------*/

// Сохранить статусы покупок (какие товары отмечены купленными)
// Данные хранятся в localStorage по ключу purchased_{reportId}
function savePurchasedStatus() {
  if (!currentReport.value?.id) return // только для сохранённых отчётов
  const key = `purchased_${currentReport.value.id}`
  const status = {}
  currentReport.value.results.forEach(item => {
    status[item.itemName] = item.purchased || false
  })
  localStorage.setItem(key, JSON.stringify(status))
}

// Загрузить статусы покупок из localStorage
function loadPurchasedStatus() {
  if (!currentReport.value?.id) return
  const key = `purchased_${currentReport.value.id}`
  const saved = localStorage.getItem(key)
  if (saved) {
    const status = JSON.parse(saved)
    currentReport.value.results.forEach(item => {
      item.purchased = status[item.itemName] || false
    })
  }
}

</script>

/* ОСНОВНОЙ КОНТЕЙНЕР СТРАНИЦЫ */
<style scoped>
.analytics-page {
  min-height: 100vh;
  background: radial-gradient(circle at top, #928a82, #665b55);
  padding: 40px;
}

/* Контейнер для контента */
.analytics-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* ОБЩИЕ СТИЛИ ДЛЯ ПАНЕЛИ */

/* Панели */
.selection-panel,
.reports-panel,
.results-panel {
  background: rgb(204, 187, 182);
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.35);
}

/* Заголовки панелей */
.panel-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 3px solid #7c615c;
}

/* Радио-кнопки для выбора списка */
.lists-radio {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 25px;
}

/* Одна опция (список) */
.list-radio {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: #f5f5f5;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
}

.list-radio:hover {
  background: #d5e3f8;
}

/* Радио-кнопка */
.list-radio input {
  width: 25px;
  height: 25px;
  cursor: pointer;
}

/* Текст названия списка */
.list-radio span {
  font-size: 20px;
}

/* КНОПКИ */
.panel-buttons {
  display: flex;
}

.analyze-button {
  padding: 12px 30px;
  background: #347fd4;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

.analyze-button:hover:not(:disabled) {
  background: #1c65aa;
  transform: scale(1.02);
}

.analyze-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Сохраненные отчеты */
.reports-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Один отчёт в списке */
.report-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 10px;
  transition: 0.2s;
}

.report-item:hover {
  background: #c9dbf1;
}

/* Область с информацией об отчёте */
.report-info {
  flex: 1;
  cursor: pointer;
  padding-right: 15px;
}

/* Название отчёта */
.report-name {
  font-size: 20px;
  font-weight: bold;
  color: #000000;
}

/* Кнопка удаления отчёта */
.delete-report-img {
  width: 80px;
  cursor: pointer;
  transition: 0.2s;
}

.delete-report-img:hover {
  transform: scale(1.05);
}

/* Результаты анализа */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.results-title {
  flex: 1;
}

/* Информация о дате покупки */
.purchase-date-info {
  font-size: 23px;
  color: #000000;
  margin-top: 5px;
  font-weight: normal;
}

.purchase-date-info.warning {
  color: #000000;
}

.results-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* Кнопка сохранения отчёта */
.save-report-btn {
  padding: 8px 20px;
  background: #477ef5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 25px;
  font-weight: bold;
  transition: 0.2s;
}

.save-report-btn:hover {
  background: #2c57a7;
  transform: scale(1.02);
}

/* Кнопка закрытия отчёта */
.close-report-img {
  width: 80px;
  cursor: pointer;
  transition: 0.2s;
}

.close-report-img:hover {
  transform: scale(1.05);
}

/* ГРУППЫ ТОВАРОВ */

/* Одна группа */
.category-group {
  margin-bottom: 30px;
  border: 3px solid rgba(94, 56, 45, 0.66);
  border-radius: 15px;
  overflow: hidden;
}

/* Заголовок группы */
.category-group-header {
  background: #829eda;
  padding: 15px 20px;
  white-space: pre-line;  /* Позволяет переносить строку (\n) */
}

/* Название группы */
.category-name {
  font-size: 20px;
  font-weight: bold;
  color: white;
}

/* Специальный стиль для группы "Без кешбэка" */
.no-cashback-group .category-group-header {
  background: #997d6d;
}

/* Контейнер с товарами внутри группы */
.category-items {
  padding: 10px;
}

/* Один товар в результатах */
.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin: 10px;
  background: #ffffff;
  border-radius: 10px;
  transition: 0.2s;
}

/* Стиль для отмеченного товара */
.result-item.purchased {
  opacity: 0.5;
  background: #e8e8e8;
}

/* Чекбокс покупки */
.purchase-check {
  margin-right: 15px;
}

.purchase-check input {
  width: 30px;
  height: 30px;
  cursor: pointer;
}

/* Информация о товаре (название, категория, подсказки) */
.item-info {
  flex: 1;
}

.item-name {
  font-size: 20px;
  font-weight: bold;
  color: #000000;
}

.item-category {
  font-size: 16px;
  color: #666;
  margin-top: 5px;
}

/* Подсказка о будущем особом кешбэке */
.special-advice {
  font-size: 15px;
  color: #727272;
  margin-top: 5px;
  font-weight: normal;
}

.date-advice {
  font-size: 12px;
  color: #2196F3;
  margin-top: 3px;
  font-weight: normal;
}

/* Блок с информацией о кешбэке */
.cashback-info {
  text-align: right;
}

/* Название карты */
.card-name {
  font-size: 20px;
  font-weight: bold;
  color: #1b263a;
}

.percent {
  font-size: 24px;
  font-weight: bold;
  margin-top: 7px;
  color: #3b7cdd;
}

/* Сообщение об отсутствии кешбэка */
.no-cashback {
  padding: 8px 15px;
  background: #f5d4d9;
  border-radius: 8px;
  color: #000000;
  font-weight: bold;
}

/* Пояснение для активного особого кешбэка или баллов */
.condition-desc {
  font-size: 15px;
  color: #666;
  margin-top: 5px;
  font-weight: normal;
  font-style: italic;
}

.points-advice {
  font-size: 12px;
  color: #2761b9;
  margin-top: 5px;
  font-weight: normal;
}
</style>