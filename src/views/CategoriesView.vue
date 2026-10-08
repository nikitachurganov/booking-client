<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftOutlined, CalendarOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { fetchCategories, type Category } from '@/api/categories'

const router = useRouter()
const categories = ref<Category[]>([])
const query = ref('')

onMounted(async () => {
  categories.value = await fetchCategories()
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? categories.value.filter((c) => c.title.toLowerCase().includes(q)) : categories.value
})

const formatCount = (n: number) => (n > 99 ? '99+' : String(n))

const goBack = () => (window.history.state?.back ? router.back() : router.push({ name: 'categories' }))
</script>

<template>
  <main class="page">
    <a-breadcrumb class="breadcrumb">
      <a-breadcrumb-item><router-link to="/">Главная</router-link></a-breadcrumb-item>
      <a-breadcrumb-item>Бронирование</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="content-header">
      <a-button type="text" class="back" aria-label="Назад" @click="goBack"><ArrowLeftOutlined /></a-button>
      <h1 class="title">Бронирование</h1>
      <a-button
        class="my-bookings"
        title="Мои бронирования"
        aria-label="Мои бронирования"
        @click="router.push({ name: 'my-bookings' })"
      >
        <template #icon><CalendarOutlined /></template>
        <span class="my-bookings-label">Мои бронирования</span>
      </a-button>
    </div>

    <a-input v-model:value="query" class="search" allow-clear placeholder="Поиск объекта по названию">
      <template #prefix><SearchOutlined /></template>
    </a-input>

    <div class="grid">
      <router-link
        v-for="c in filtered"
        :key="c.id"
        :to="{ name: 'showcase', params: { id: c.id } }"
        class="card"
        :class="{ empty: !c.count }"
      >
        <div class="card-head">
          <span class="card-title">{{ c.title }}</span>
          <span class="count" :title="String(c.count)" :aria-label="`Объектов: ${c.count}`">{{ formatCount(c.count) }}</span>
        </div>
        <span class="slot">{{ c.nearestSlot ? `Ближайший слот: ${c.nearestSlot}` : 'Нет слотов' }}</span>
      </router-link>
    </div>
    <a-empty v-if="!filtered.length" description="Ничего не найдено">
      <a-button v-if="query" @click="query = ''">Сбросить поиск</a-button>
    </a-empty>
  </main>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 12px 20px 20px;
}
.breadcrumb {
  padding: 0 4px;
}
.content-header {
  display: flex;
  align-items: center;
  gap: 4px;
}
.back {
  width: 32px;
  height: 32px;
  padding: 0;
}
.title {
  flex: 1;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  color: rgba(0, 0, 0, 0.88);
}
.search {
  width: 420px;
  max-width: 100%;
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  align-items: start;
}
.card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  text-align: left;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.card:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: 2px;
}
.card:active {
  background: #fafafa;
}
.card.empty .count,
.card.empty .slot {
  color: rgba(0, 0, 0, 0.45);
}
@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }
}
.card:hover {
  border-color: #1677ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}
.card-head {
  position: relative;
  padding-right: 40px;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #000;
}
.count {
  position: absolute;
  top: -4px;
  right: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
  background: #f5f5f5;
  border-radius: 8px;
}
.slot {
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.65);
}
@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 560px) {
  .page {
    gap: 16px;
    padding: 12px 16px 24px;
  }
  .content-header :deep(.ant-btn) {
    min-height: 44px;
  }
  .back {
    display: none;
  }
  .title {
    flex: 1 1 0;
    min-width: 0;
    font-size: 18px;
  }
  .my-bookings {
    flex: none;
    width: 44px;
    height: 44px;
    padding: 0;
  }
  .my-bookings-label {
    display: none;
  }
  .search {
    width: 100%;
  }
  .search :deep(input),
  .search {
    min-height: 44px;
  }
  .grid {
    grid-template-columns: 1fr;
  }
  .card {
    min-height: 64px;
  }
}
</style>

