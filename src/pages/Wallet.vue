<template>
<!-- Главная страница - кошелек -->
<!-- Динамическая высота страницы зависит от количества карт -->
    <div 
        class="wallet-page"
        :style="{ minHeight: pageHeight + 'vh' }"
    >
        <div class="wallet-container">
            <img class="wallet-back" src="../assets/wallet-back.png" />

            <!-- КАРТЫ -->
            <!-- Высота контейнера зависит от количества карт -->
            <div class="cards-container"
                 :style="{ height: (cards.length * 100 + 200) + 'px' }">
                <!-- Карты располагаются друг над другом с наложением -->
                <!-- bottom - вертикальное смещение, zIndex - порядок наложения -->
                <div
                    v-for="(card, index) in cards"
                    :key="card.id"
                    class="card-wrapper"
                    :style="{ 
                        bottom: `${130 + index * 110}px`,
                        zIndex: cards.length - index
                    }"
                >
                    <img class="card-image" src="../assets/card.png" />
                    <!-- НАЗВАНИЕ КАРТЫ (с возможностью редактирования) -->
                    <div class="card-title">
                        <input
                            v-if="card.isEditing"
                            v-model="card.tempName"
                            class="card-input"
                            @keyup.enter="saveEdit(card)"
                        />
                        <div v-else>
                            {{ card.name }}
                        </div>
                    </div>
                    <!-- КНОПКИ УПРАВЛЕНИЯ КАРТОЙ -->
                    <div class="card-buttons">
                        <img
                            v-if="!card.isEditing"
                            class="card-button"
                            src="../assets/button-edit.png"
                            @click="startEdit(card)"
                        />
                        <img
                            v-else
                            class="card-button"
                            src="../assets/button-ok.png"
                            @click="saveEdit(card)"
                        />
                        <img 
                            class="card-button" 
                            src="../assets/button-open.png" 
                            @click="openCard(card)"
                        />
                    </div>
                </div>
            </div>

            <!-- КНОПКА ДОБАВЛЕНИЯ НОВОЙ КАРТЫ -->
            <div 
                class="add-button-wrapper"
                :class="{ disabled: isMaxCards }"
                @click="addCard"
            >
                <img class="wallet-button" src="../assets/button-wallet-add.png" />
                <div class="button-text">Добавить карту</div>
            </div>

            <img class="wallet-front" src="../assets/wallet-front.png" />

            <!-- ПАНЕЛЬ ОТКРЫТОЙ КАРТЫ -->
            <div v-if="selectedCard" class="opened-card-panel">
                <!-- ФОРМА ДОБАВЛЕНИЯ/РЕДАКТИРОВАНИЯ КЕШБЭКА -->
                <div class="cashback-form">
                    <!-- 1. Сначала тип кешбэка -->
                    <select v-model="cashbackForm.type" class="cashback-select">
                        <option value="REGULAR">Обычный (рубли)</option>
                        <option value="POINTS">Баллы (с конвертацией)</option>
                        <option value="SPECIAL">Особый (по дате/дню)</option>
                    </select>

                    <!-- 2. Затем выбор категория -->
                    <select v-model="cashbackForm.categoryId" class="cashback-select">
                        <option value="" disabled>Выберите категорию</option>
                        <option 
                            v-for="category in cashbackCategories" 
                            :key="category.id" 
                            :value="category.id"
                        >
                            {{ category.name }}
                        </option>
                    </select>

                    <!-- 3. Затем ввод процент -->
                    <input v-model.number="cashbackForm.percent" type="number" step="0.1" placeholder="Процент" class="cashback-input"/>

                    <!-- 4. Доп поля для других типов -->

                    <!-- Для типа БАЛЛЫ - поле курса конвертации -->
                    <div v-if="cashbackForm.type === 'POINTS'" class="points-fields">
                        <input v-model.number="cashbackForm.conversionRate" type="number" step="0.1" 
                            placeholder="Курс: 1 балл = ? руб" class="cashback-input"/>
                    </div>

                    <!-- Для типа ОСОБЫЙ - выбор условий действия -->
                    <div v-if="cashbackForm.type === 'SPECIAL'" class="special-fields">
                        
                        <!-- Подтип особого кешбэка -->
                        <select v-model="cashbackForm.specialType" class="cashback-select special-select">
                            <option value="weekday">Каждый день недели</option>
                            <option value="period">Период дат</option>
                            <option value="single">Конкретная дата</option>
                        </select>

                        <!-- Для типа "день недели" - выбор дня -->
                        <div v-if="cashbackForm.specialType === 'weekday'" class="date-fields-group">
                            <select v-model="cashbackForm.weekDay" class="cashback-select date-field">
                                <option :value="1">Понедельник</option>
                                <option :value="2">Вторник</option>
                                <option :value="3">Среда</option>
                                <option :value="4">Четверг</option>
                                <option :value="5">Пятница</option>
                                <option :value="6">Суббота</option>
                                <option :value="7">Воскресенье</option>
                            </select>
                        </div>

                        <!-- Для типа "период дат" - начальная и конечная дата -->
                        <div v-if="cashbackForm.specialType === 'period'" class="date-fields-group period-group">
                            <input type="date" v-model="cashbackForm.startDate" class="cashback-input date-field date-start"/>
                            <span class="date-separator">—</span>
                            <input type="date" v-model="cashbackForm.endDate" class="cashback-input date-field date-end"/>
                        </div>

                        <!-- Для типа "конкретная дата" - одна дата -->
                        <div v-if="cashbackForm.specialType === 'single'" class="date-fields-group">
                            <input type="date" v-model="cashbackForm.startDate" class="cashback-input date-field"/>
                        </div>
                    </div>

                    <!-- КНОПКА СОХРАНЕНИЯ КЕШБЭКА -->
                    <button class="cashback-save-button" @click="saveCashback">
                        {{ editingCashback ? 'Сохранить изменения' : 'Добавить кешбэк' }}
                    </button>
                </div>

                <!-- ОТКРЫТАЯ КАРТА -->
                <img class="opened-card-image" src="../assets/card.png" />

                <div class="opened-card-title">
                    {{ selectedCard.name }}
                </div>

                <div class="opened-card-top-buttons">
                    <img
                        class="opened-card-button"
                        src="../assets/button-del.png"
                        @click="confirmDeleteCard"
                    />
                </div>

                <!-- КОНТЕЙНЕР СО СПИСКОМ КЕШБЭКОВ (с пагинацией) -->
                <div class="cashbacks-container">

                    <!-- стредка влево -->
                    <div 
                        class="cashback-arrow left" 
                        @click="prevCashbackPage"
                        :class="{ disabled: currentCashbackPage === 0 }"
                    >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>

                    <!-- Список кешбэков текущей страницы -->
                    <div class="cashbacks-list">
                        <!-- Реальные кешбэки -->
                        <div
                            v-for="(cashback, idx) in paginatedCashbacks"
                            :key="cashback.id"
                            class="cashback-item"
                        >
                            <!-- Иконка категории -->
                            <div class="cashback-icon">
                                <img
                                    class="cashback-category-image"
                                    :src="getCategoryImage(cashback.category.id)"
                                    alt=""
                                />
                            </div>

                            <!-- Название и процент -->
                            <div class="cashback-name">
                                {{ cashback.category.name }}
                            </div>
                            <div class="cashback-percent">
                                {{ cashback.percent }}%
                            </div>

                            <div class="cashback-buttons">
                                <img
                                    class="cashback-action-button"
                                    src="../assets/button-edit.png"
                                    @click="editCashback(cashback)"
                                />
                                <img
                                    class="cashback-action-button"
                                    src="../assets/button-del.png"
                                    @click="confirmDeleteCashback(cashback, idx)"
                                />
                            </div>
                        </div>

                        <!-- Заглушки для пустых мест кешбэков -->
                        <div 
                            v-for="n in (CASHBACKS_PER_PAGE - paginatedCashbacks.length)" 
                            :key="'empty-' + n"
                            class="cashback-item empty"
                        >
                            <div class="cashback-icon empty-icon"></div>
                            <div class="cashback-name">—</div>
                            <div class="cashback-percent">—</div>
                        </div>
                    </div>

                    <!-- Стрелка вправо -->
                    <div 
                        class="cashback-arrow right" 
                        @click="nextCashbackPage"
                        :class="{ disabled: currentCashbackPage === totalCashbackPages - 1 }"
                    >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>

                <!-- Индикатор страниц -->
                <div class="page-indicator" v-if="totalCashbackPages > 1">
                    {{ currentCashbackPage + 1 }} / {{ totalCashbackPages }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
// Импорт API-функций для работы с картами и кешбэками
import { 
    getCards, 
    createCard, 
    updateCard, 
    deleteCard as apiDeleteCard, 
    addCashback as apiAddCashback,
    updateCashback as apiUpdateCashback,
    deleteCashback as apiDeleteCashback
} from '../api/cards'
// Импорт API-функции для получения категорий кешбэка
import { getCashbackCategories } from '../api/categories'

/* ---------------------------
   CARDS (данные карты)
----------------------------*/

const cards = ref([])                     // Список всех карт пользователя
const selectedCard = ref(null)            // Выбранная (открытая) карта
const cashbackCategories = ref([])        // Список всех категорий кешбэка

// Форма добавления/редактирования кешбэка
const cashbackForm = ref({
    categoryId: '',             // ID выбранной категории
    percent: '',                // процент кешбэка
    type: 'REGULAR',            // тип: REGULAR / POINTS / SPECIAL
    conversionRate: '',         // курс конвертации (для баллов)
    specialType: 'weekday',     // подтип особого кешбэка: weekday / period / single
    weekDay: 5,                 // день недели (1-7, где 5 = пятница)
    startDate: '',              // начальная дата (для особого)
    endDate: ''                 // конечная дата (для периода)
})

// Редактируемый кешбэк (если не null — значит в режиме редактирования)
const editingCashback = ref(null)

/* ---------------------------
   ПАГИНАЦИЯ КЕШБЭКОВ
----------------------------*/

const currentCashbackPage = ref(0)     // текущая страница
const CASHBACKS_PER_PAGE = 4           // кол-во кешбэков на одной странице

// Общее количество страниц
const totalCashbackPages = computed(() => {
    if (!selectedCard.value?.cashbacks) return 0
    return Math.ceil(selectedCard.value.cashbacks.length / CASHBACKS_PER_PAGE)
})

// Кешбэки для текущей страницы
const paginatedCashbacks = computed(() => {
    if (!selectedCard.value?.cashbacks) return []
    const start = currentCashbackPage.value * CASHBACKS_PER_PAGE
    const end = start + CASHBACKS_PER_PAGE
    return selectedCard.value.cashbacks.slice(start, end)
})

// Функция для получения реального индекса кешбэка в полном массиве
const getRealIndex = (pageIndex) => {
    return currentCashbackPage.value * CASHBACKS_PER_PAGE + pageIndex
}

// Следующая страница
const nextCashbackPage = () => {
    if (currentCashbackPage.value < totalCashbackPages.value - 1) {
        currentCashbackPage.value++
    }
}

// Предыдущая страница
const prevCashbackPage = () => {
    if (currentCashbackPage.value > 0) {
        currentCashbackPage.value--
    }
}

/* ---------------------------
   ЖИЗНЕННЫЙ ЦИКЛ
----------------------------*/

onMounted(async () => {
    // Загружаем все карты пользователя с сервера
    const res = await getCards()
    // Добавляем каждому карте служебные поля для редактирования
    cards.value = res.data.map(card => ({
        ...card,
        isEditing: false,     // режим редактирования названия
        tempName: ''          // временное имя при редактировании
    }))

    // Загрузка всех категорий кешбэка
    const categoriesRes = await getCashbackCategories()
    cashbackCategories.value = categoriesRes.data

})

/* ---------------------------
   ФУНКЦИИ УПРАВЛЕНИЯ КАРТАМИ
----------------------------*/

// Открыть карту — показать панель с её кешбэками
function openCard(card) {
    selectedCard.value = card
    currentCashbackPage.value = 0  // сброс пагинации на первую страницу
}

// Добавить новую карту
async function addCard() {
    if (isMaxCards.value) return  // не более 10

    // Создаём объект новой карты с временным названием
    const newCard = {
        name: `Карта ${cards.value.length + 1}`,
        cashbacks: []
    }

    // Отправка запроса на сервер
    const res = await createCard(newCard)

    // Добавляем карту в локальный список
    cards.value.push({
        ...res.data,
        isEditing: false,
        tempName: ''
    })
}

// Начать редактирование названия карты
function startEdit(card) {
    card.isEditing = true
    card.tempName = card.name  // Текущее имя во временное поле
}

// Сохранить отредактированное название карты
async function saveEdit(card) {
    const newName = card.tempName.trim()

    if (newName.length === 0) {
        card.isEditing = false
        return
    }

    // Обновленное название отправляется на сервер
    const updated = {
        id: card.id,
        name: newName,
        cashbacks: card.cashbacks
    }

    const res = await updateCard(updated)

    // Обновляем локальные данные
    card.name = res.data.name
    card.isEditing = false
}

/* ---------------------------
   ФУНКЦИИ УПРАВЛЕНИЯ КЕШБЭКАМИ
----------------------------*/

// Сохранить кешбэк (добавить новый или обновить существующий)
async function saveCashback() {
    try {
        if (!selectedCard.value) return

        // ВАЛИДАЦИЯ: проверяем, что категория выбрана
        if (!cashbackForm.value.categoryId || cashbackForm.value.categoryId === '') {
            alert('Пожалуйста, выберите категорию')
            return
        }

        // ВАЛИДАЦИЯ: проверяем, что процент указан
        if (!cashbackForm.value.percent && cashbackForm.value.percent !== 0) {
            alert('Пожалуйста, введите процент кешбэка')
            return
        }

        // Преобразуем процент в число и проверяем диапазон
        const percentNum = Number(cashbackForm.value.percent)
        if (isNaN(percentNum)) {
            alert('Процент должен быть числом')
            return
        }
        if (percentNum < 0 || percentNum > 100) {
            alert('Процент кешбэка должен быть от 0 до 100')
            return
        }

        // Базовый объект кешбэка (общие поля)
        let cashbackData = {
            percent: percentNum,
            category: { id: Number(cashbackForm.value.categoryId) },
            type: cashbackForm.value.type,
            conversionRate: null,
            weekDay: null,
            startDate: null,
            endDate: null
        }

        // ВАЛИДАЦИЯ: для типа БАЛЛЫ
        if (cashbackForm.value.type === 'POINTS') {
            if (!cashbackForm.value.conversionRate || cashbackForm.value.conversionRate <= 0) {
                alert('Для баллов укажите курс конвертации (1 балл = X рублей)')
                return
            }
            cashbackData.conversionRate = Number(cashbackForm.value.conversionRate)
        }
        
        // ВАЛИДАЦИЯ: для типа ОСОБЫЙ
        if (cashbackForm.value.type === 'SPECIAL') {
            if (cashbackForm.value.specialType === 'weekday') {
                if (!cashbackForm.value.weekDay) {
                    alert('Выберите день недели')
                    return
                }
                cashbackData.weekDay = Number(cashbackForm.value.weekDay)
            } else if (cashbackForm.value.specialType === 'period') {
                if (!cashbackForm.value.startDate || !cashbackForm.value.endDate) {
                    alert('Укажите период дат (начало и конец)')
                    return
                }
                cashbackData.startDate = cashbackForm.value.startDate
                cashbackData.endDate = cashbackForm.value.endDate
            } else if (cashbackForm.value.specialType === 'single') {
                if (!cashbackForm.value.startDate) {
                    alert('Укажите дату')
                    return
                }
                cashbackData.startDate = cashbackForm.value.startDate
            }
        }

        // Если редактируем существующий кешбэк
        if (editingCashback.value) {
            const res = await apiUpdateCashback(editingCashback.value.id, cashbackData)
            // Находим индекс и заменяем
            const index = selectedCard.value.cashbacks.findIndex(
                c => c.id === editingCashback.value.id
            )
            selectedCard.value.cashbacks[index] = res.data
            // Выходим из режима редактирования
            editingCashback.value = null

        // Иначе создаём новый кешбэк
        } else {
            const res = await apiAddCashback(selectedCard.value.id, cashbackData)
            if (!selectedCard.value.cashbacks) {
                selectedCard.value.cashbacks = []
            }
            selectedCard.value.cashbacks.push(res.data)

            // Переключаемся на последнюю страницу, чтобы увидеть новый кешбэк
            setTimeout(() => {
                currentCashbackPage.value = totalCashbackPages.value - 1
            }, 100)
        }

        // Сбрасываем форму
        cashbackForm.value = {
            categoryId: '',
            percent: '',
            type: 'REGULAR',
            conversionRate: '',
            specialType: 'weekday',
            weekDay: 5,
            startDate: '',
            endDate: ''
        }

    } catch (error) {
        // Обработка ошибок валидации с сервера
        console.error('Ошибка:', error)
        
        if (error.response?.status === 400 && error.response?.data) {
            const errors = error.response.data
            let errorMessage = ''
            
            if (errors.category) errorMessage += `Категория: ${errors.category}\n`
            if (errors.percent) errorMessage += `Процент: ${errors.percent}\n`
            if (errors.type) errorMessage += `Тип: ${errors.type}\n`
            if (errors.conversionRate) errorMessage += `Курс: ${errors.conversionRate}\n`
            if (errors.weekDay) errorMessage += `День недели: ${errors.weekDay}\n`
            if (errors.validation) errorMessage += `${errors.validation}\n`
            if (errors.message) errorMessage += errors.message
            
            if (errorMessage) {
                alert(`Ошибка валидации:\n${errorMessage}`)
            } else {
                alert('Ошибка при сохранении кешбэка')
            }
        } else {
            alert('Ошибка при сохранении кешбэка')
        }
    }
}

// Редактировать кешбэк — заполнить форму его данными
function editCashback(cashback) {
    editingCashback.value = cashback

    // Определяем подтип особого кешбэка по заполненным полям
    let specialType = 'weekday'
    if (cashback.startDate && cashback.endDate) {
        specialType = 'period'
    } else if (cashback.startDate && !cashback.endDate) {
        specialType = 'single'
    } else if (cashback.weekDay !== null && cashback.weekDay !== undefined) {
        specialType = 'weekday'
    }

    // Заполняем форму данными из выбранного кешбэка
    cashbackForm.value = {
        categoryId: cashback.category?.id || '',
        percent: cashback.percent || '',
        type: cashback.type || 'REGULAR',
        conversionRate: cashback.conversionRate || '',
        specialType: specialType,
        weekDay: cashback.weekDay || 5,
        startDate: cashback.startDate || '',
        endDate: cashback.endDate || ''
    }
}

// Сбросить форму (очистить все поля)
function resetForm() {
    cashbackForm.value = {
        categoryId: '',
        percent: '',
        type: 'REGULAR',
        conversionRate: '',
        specialType: 'weekday',
        weekDay: 5,
        startDate: '',
        endDate: ''
    }
    editingCashback.value = null
}

// Функция с подтверждением удаления кешбэка
function confirmDeleteCashback(cashback, idx) {
    const categoryName = cashback.category?.name || 'этот кешбэк'
    if (confirm(`Удалить кешбэк?`)) {
        removeCashback(cashback.id, getRealIndex(idx))
    }
}

// Удалить кешбэк
async function removeCashback(cashbackId, realIndex) {
    if (!selectedCard.value) return

    // Запрос на севрер
    await apiDeleteCashback(cashbackId)

    // Удаляем из локального массива
    selectedCard.value.cashbacks.splice(realIndex, 1)

    // Если на текущей странице не осталось элементов — переключаемся на предыдущую
    if (paginatedCashbacks.value.length === 0 && currentCashbackPage.value > 0) {
        currentCashbackPage.value--
    }
}

/* ---------------------------
   ФУНКЦИИ УДАЛЕНИЯ КАРТЫ
----------------------------*/

// Подтверждение удаления карты
function confirmDeleteCard() {
    if (confirm(`Удалить карту? Все кешбэки этой карты также будут удалены.`)) {
        deleteCard()
    }
}

// Удалить карту
async function deleteCard() {
    if (!selectedCard.value) return

    // Запрос на сервер
    await apiDeleteCard(selectedCard.value.id)

    // Удаляем карту из локального массива
    cards.value = cards.value.filter(
        card => card.id !== selectedCard.value.id
    )

    // Закрываем панель открытой карты
    selectedCard.value = null
}

// Максимальное кол-во карт - 10
const isMaxCards = computed(() => cards.value.length >= 10)

// Получить путь к картинке категории по её ID
function getCategoryImage(categoryId) {
    const images = {
        1: '/src/assets/categories/0.png',
        2: '/src/assets/categories/1.png',
        3: '/src/assets/categories/2.png',
        4: '/src/assets/categories/3.png',
        5: '/src/assets/categories/4.png',
        6: '/src/assets/categories/5.png',
        7: '/src/assets/categories/6.png',
        8: '/src/assets/categories/7.png',
        9: '/src/assets/categories/8.png',
        10: '/src/assets/categories/9.png',
        11: '/src/assets/categories/10.png',
        12: '/src/assets/categories/11.png',
        13: '/src/assets/categories/12.png',
        14: '/src/assets/categories/13.png',
        15: '/src/assets/categories/14.png',
        16: '/src/assets/categories/15.png',
        17: '/src/assets/categories/16.png',
        18: '/src/assets/categories/17.png',
        19: '/src/assets/categories/18.png',
        20: '/src/assets/categories/19.png',
        21: '/src/assets/categories/20.png',
        22: '/src/assets/categories/21.png',
        23: '/src/assets/categories/22.png',
        24: '/src/assets/categories/23.png',
        25: '/src/assets/categories/24.png',
        26: '/src/assets/categories/25.png',
        27: '/src/assets/categories/26.png',
        28: '/src/assets/categories/27.png',
        64: '/src/assets/categories/63.png'
    }
    return images[categoryId] || '/src/assets/categories/0.png'
}

// Динамическая высота страницы (зависит от количества карт)
const pageHeight = computed(() => {
    const baseHeight = 90   // базовая высота
    const extraCards = Math.max(0, cards.value.length - 3)   // карты сверх 3 штук
    return baseHeight + (extraCards * 11.5)   // каждая нвоая карта увеличивает высоту
})
</script>

<style scoped>
/* Основной контейнер страницы */
.wallet-page {
    position: relative;          /* Для позиционирования вложенных элементов */
    width: 100%;
    min-height: 100vh;           /* Минимальная высота на весь экран */
    background: radial-gradient(circle at top, #928a82, #665b55);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;   /* Прижимаем содержимое к низу */
    padding-bottom: 20px;
}

/* Контейнер для всего кошелька */
.wallet-container {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-end;
}

/* Задняя часть кошелька (фоновое изображение) */
.wallet-back {
    width: 800px;
    position: relative;
    z-index: 1;              /* Ниже передней части */
    transform: translateX(-428px);
}

/* Контейнер со всеми картами */
.cards-container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 10;            /* Выше фонового изображения */
    pointer-events: none;   /* Отключаем события мыши для контейнера */
}

/* Отдельная карат */
.card-wrapper {
    position: absolute;
    left: 25%;
    transform: translateX(-49%);  /* Центрирование относительно левого края */
    transition: 0.3s;
    pointer-events: auto;
}

/* Изображение карты */
.card-image {
    width: 650px;
    display: block;
}

/* Название карты (абсолютное позиционирование поверх картинки) */
.card-title {
    position: absolute;
    top: 60px;
    left: 70px;
    color: black;
    font-size: 35px;
    font-weight: bold;
}

/* Поле ввода при редактировании названия карты */
.card-input {
    font-size: 35px;
    font-weight: bold;
    border: 2px solid rgba(54, 98, 179, 0.33);
    border-radius: 12px;
    margin-left: -138px;
    margin-top: -18px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.4);
    color: black;
    width: 60%;
    transition: 0.2s;
}

/* Кнопки управления картой (редактирование, открыть) */
.card-buttons {
    position: absolute;
    top: 25px;
    right: 50px;
    display: flex;
    gap: 5px;
}

/* Стиль каждой кнопки на карте */
.card-button {
    width: 100px;
    cursor: pointer;
    transition: 0.2s;
}

/* Анимация кнопок */
.card-button:hover {
    transform: scale(1.1);
}

/* Кнопка добавления новой карты */
.add-button-wrapper {
    position: absolute;
    bottom: 220px;
    left: 17.5%;
    transform: translateX(-50%);
    z-index: 200;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* Изображение кнопки */
.wallet-button {
    width: 320px;
}

/* Текст на кнопке */
.button-text {
    position: absolute;
    top: 54px;
    color: black;
    font-size: 30px;
    font-weight: bold;
}

/* Передняя часть кошелька (закрывает нижнюю часть карт) */
.wallet-front {
    position: absolute;
    bottom: -9px;
    width: 730px;
    left: 6%;
    z-index: 100;
    pointer-events: none;
}

/* ------------------------------------------
   ПАНЕЛЬ ОТКРЫТОЙ КАРТЫ (появляется справа)
------------------------------------------- */

/* Панель открытой карты */
.opened-card-panel {
    position: fixed;
    right: 80px;
    bottom: -30px;
    width: 850px;
    height: 900px;
    z-index: 300;     /* Поверх всего */
}

/* Изображение открытой карты */
.opened-card-image {
    width: 100%;
    display: block;
}

/* Название открытой карты */
.opened-card-title {
    position: absolute;
    top: 80px;
    left: 90px;
    font-size: 40px;
    font-weight: bold;
    color: black;
}

/* Кнопки в верхней части открытой карты */
.opened-card-top-buttons {
    position: absolute;
    top: 40px;
    right: 60px;
    display: flex;
    gap: 10px;
}

/* Стиль кнопок в верхней части */
.opened-card-button {
    width: 100px;
    cursor: pointer;
    transition: 0.2s;
}

/* Анимация кнопок */
.opened-card-button:hover {
    transform: scale(1.1);
}

/* Контейнер со списком кешбэков и стрелками */
.cashbacks-container {
    position: absolute;
    top: 160px;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
}

/* Сетка кешбэков */
.cashbacks-list {
    display: flex;
    justify-content: center;
    gap: 30px;
}

/* Стредки пагинации */
.cashback-arrow {
    width: 50px;
    height: 50px;
    cursor: pointer;
    transition: 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.51);
    border-radius: 50%;
    margin-top: -110px;
}

/* Анимация стрелок */
.cashback-arrow:hover {
    background: rgba(255, 255, 255, 0.66);
    transform: scale(1.05);
}

/* Отключённые стрелки */
.cashback-arrow.disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.cashback-arrow.disabled:hover {
    transform: none;
}

/* Индикатор страниц */
.page-indicator {
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 18px;
    color: white;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

/* Отдельный элемент кешбэка */
.cashback-item {
    width: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* Стиль для пустых элементов-заглушек */
.cashback-item.empty {
    opacity: 0.3;
}

/* Иконка пустого кешбэка */
.empty-icon {
    background: rgba(255, 255, 255, 0.2);
    border: 2px dashed rgba(255, 255, 255, 0.5);
}

/* Квадратная иконка категории */
.cashback-icon {
    width: 100px;
    height: 100px;
    background: white;
    border-radius: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 10px rgba(0, 27, 85, 0.31);
}

/* Изображение внутри иконки категории */
.cashback-category-image {
    width: 100%;
    height: 100%;
    object-fit: contain;     /* Сохраняем пропорции */
}

/* Название категории */
.cashback-name {
    margin-top: 15px;
    font-size: 23px;
    font-weight: bold;
    color: black;
}

/* Процент кешбэка */
.cashback-percent {
    margin-top: 5px;
    font-size: 23px;
    color: black;
}

/* Контейнер с кнопками редактирования и удаления кешбэка */
.cashback-buttons {
    display: flex;
    gap: 0px;
    margin-top: 10px;
}

/* Кнопки действий с кешбэком */
.cashback-action-button {
    width: 70px;
    cursor: pointer;
    transition: 0.2s;
}

.cashback-action-button:hover {
    transform: scale(1.1);
}

/* ------------------------------------------
   ФОРМА ДОБАВЛЕНИЯ/РЕДАКТИРОВАНИЯ КЕШБЭКА
------------------------------------------- */

/* Форма кешбэка */
.cashback-form {
    position: absolute;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
    width: 70%;
    display: flex;
    flex-direction: column;
    gap: 15px;
    border: 3px solid rgba(255, 255, 255, 0.6);
    border-radius: 25px;
    padding: 20px;
    background: rgba(0, 0, 0, 0.15);
}

/* Общие стили для выпадающих списков и полей ввода */
.cashback-select,
.cashback-input {
    height: 40px;
    border-radius: 15px;
    border: none;
    padding: 0 15px;
    font-size: 24px;
}

/* Контейнер для полей баллов и особого кешбэка */
.points-fields,
.special-fields {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* Отступ для выбора подтипа особого кешбэка */
.special-select {
    margin-bottom: 4px;
}

/* Группа полей с датами */
.date-fields-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 4px;
}

/* Горизонтальное расположение для периода дат */
.period-group {
    display: flex;
    flex-direction: row !important;
    align-items: center;
    gap: 8px;
}

/* Разделитель между датами (тире) */
.date-separator {
    color: white;
    font-size: 20px;
    font-weight: bold;
    padding: 0 4px;
}

/* Контроль ширины полей дат */
.date-field {
    width: 100%;
    min-width: 120px;
    max-width: 200px;
}

/* Для периода дат поля занимают равное пространство */
.period-group .date-start,
.period-group .date-end {
    flex: 1;
    min-width: 0;
    width: auto;
}

/* Для конкретной даты поле по центру */
.date-fields-group:not(.period-group) {
    align-items: center;
}

.date-fields-group:not(.period-group) .date-field {
    width: auto;
    min-width: 160px;
}

.date-field {
    width: 100%;
}

/* Кнопка сохранения кешбэка */
.cashback-save-button {
    height: 40px;
    border: none;
    border-radius: 15px;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    transition: 0.2s;
    margin-top: 5px;
    background: #76bdff;
}

.cashback-save-button:hover {
    background: rgb(70, 122, 235);
}
</style>