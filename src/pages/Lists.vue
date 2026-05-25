<template>
  <div
      class="lists-page"
      :style="{ minHeight: pageHeight + 'vh' }"
  >

    <!-- КНОПКА ДОБАВЛЕНИЯ -->
    <div class="add-list-button-wrapper">
      <button class="add-list-btn" @click="addList">
        Добавить список покупок
      </button>
    </div>

    <!-- СПИСКИ -->
    <div class="lists-grid">

      <div
        v-for="(list, index) in reversedLists"
        :key="list.id"
        class="list-wrapper"
      >

        <!-- КАРТИНКА -->
        <img
          class="list-image"
          src="../assets/list-one.png"
          alt=""
        >

        <!-- НАЗВАНИЕ -->
        <div class="list-title">

          <input
            v-if="list.isEditing"
            v-model="list.tempName"
            class="list-input"
            @keyup.enter="saveEdit(list)"
          />

          <div v-else>
            {{ list.name }}
          </div>

        </div>

        <!-- КНОПКИ -->
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

const router = useRouter()

function openList(id) {
  router.push(`/shopping-list/${id}`)
}

const lists = ref([])

onMounted(async () => {
  const res = await getLists() // Запрос на сервер

  lists.value = res.data.map(list => ({
    ...list,
    isEditing: false,
    tempName: ''
  }))
})

async function addList() {
  
  const newList = {
    name: `Список покупок ${lists.value.length + 1}`,
    items: []
  }

  const res = await createList(newList)

  lists.value.push({
    ...res.data,
    isEditing: false,
    tempName: ''
  })
}

function startEdit(list) {
  list.isEditing = true
  list.tempName = list.name
}

async function saveEdit(list) {
  const newName = list.tempName.trim()

  if (newName.length === 0) {
    list.isEditing = false
    return
  }

  const updated = {
    ...list,
    name: newName
  }

  try {
    const res = await updateList(updated)
    list.name = res.data.name
    list.isEditing = false
  } catch (error) {
    console.error('Ошибка при сохранении списка:', error)
    if (error.response?.status === 400 && error.response?.data) {
      const errors = error.response.data
      const errorMessages = Object.values(errors).join('\n')
      alert(`Ошибка валидации:\n${errorMessages}`)
    } else {
      alert('Ошибка при сохранении списка')
    }
  }
}

/*
Новые списки должны появляться слева сверху.
Поэтому отображаем массив наоборот.
*/

const reversedLists = computed(() => {
  return [...lists.value].reverse()
})

/*
Высота страницы:
до 6 списков не растет,
после начинает увеличиваться
*/

const pageHeight = computed(() => {
  // Количество строк (до 3 списков)
  const rows = Math.ceil(lists.value.length / 3)

  return Math.max(92, 90 + (rows - 2) * 20)

})
</script>

<style scoped>

.lists-page {
  width: 100%;
  background: radial-gradient(circle at top, #928a82, #665b55);
  padding-top: 60px;
  padding-bottom: 80px;
  box-sizing: border-box;
}

/* КНОПКА ДОБАВЛЕНИЯ */

.add-list-button-wrapper {
  margin-top: -20px;
  margin-left: 40px;
  margin-bottom: 30px;
  text-align: left;
}

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

.add-list-btn:hover {
  transform: scale(1.02);
  background: #3278e0;
}

.add-list-btn:active {
  transform: scale(0.98);
}

/* СЕТКА */

.lists-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 50px;
  justify-items: center;
  width: 100%;
  padding-left: 40px;
  padding-right: 40px;
  box-sizing: border-box;
}

/* СПИСОК */

.list-wrapper {
  position: relative;
  width: 480px;
  transition: 0.2s;
  filter: drop-shadow(0 12px 22px rgba(0,0,0,0.15));
}

.list-wrapper:hover {
  transform: translateY(-5px);
}

/* КАРТИНКА */

.list-image {
  width: 100%;
  display: block;
  
}

/* НАЗВАНИЕ */

.list-title {
  position: absolute;
  top: 65px;
  left: 40px;
  color: black;
  font-size: 35px;
  font-weight: bold;
}

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

/* КНОПКИ */

.list-buttons {
  position: absolute;
  bottom: 40px;
  right: 250px;
  display: flex;
  gap: 10px;
}

.list-button {
  width: 90px;
  cursor: pointer;
  transition: 0.2s;
}

.list-button:hover {
    transform: scale(1.1);
}

</style>