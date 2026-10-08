<script setup lang="ts">
import { computed, h, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  BarsOutlined,
  DownOutlined,
  FilterFilled,
  SearchOutlined,
} from '@ant-design/icons-vue'
import dayjs, { type Dayjs } from 'dayjs'
import { fetchCategories, type Category } from '@/api/categories'
import { fetchObjects, type BookingObject } from '@/api/objects'
import ObjectCard from '@/components/ObjectCard.vue'
import ObjectModal from '@/components/ObjectModal.vue'

const route = useRoute()
const router = useRouter()

const categories = ref<Category[]>([])
const items = ref<BookingObject[]>([])
const loading = ref(false)

const categoryId = computed(() => String(route.params.id ?? ''))

// Фильтры
const query = ref('')
const startAt = ref<Dayjs>()
// Первый формат — отображаемый, остальные — допустимый ручной ввод
const startAtFormats = ['DD.MM.YYYY HH:mm', 'DD.MM.YYYY', 'HH:mm']

// Время по умолчанию зависит от выбранного дня:
// сегодня — текущее время, любой другой день — начало дня 00:00.
// Срабатывает, когда введена только дата (время 00:00) или при смене дня
// без изменения времени (календарь переносит прежнее время на новый день).
const defaultTimeFor = (v: Dayjs) => {
  const now = dayjs()
  return v.isSame(now, 'day') ? v.hour(now.hour()).minute(now.minute()).second(0) : v.startOf('day')
}
watch(startAt, (v, old) => {
  if (!v) return
  const now = dayjs()
  const midnight = v.hour() === 0 && v.minute() === 0
  // календарь подставляет текущее время на любой выбранный день
  const nowTimeOnOtherDay = !v.isSame(now, 'day') && v.hour() === now.hour() && v.minute() === now.minute()
  const dayChangedKeepingTime =
    !!old && !v.isSame(old, 'day') && v.hour() === old.hour() && v.minute() === old.minute()
  if (midnight || nowTimeOnOtherDay || dayChangedKeepingTime) {
    const next = defaultTimeFor(v)
    if (!next.isSame(v, 'minute')) startAt.value = next
  }
})
const disabledPastDays = (d: Dayjs) => d.isBefore(dayjs().startOf('day'))
const duration = ref(0) // 0 — любая, иначе минуты
const bookingType = ref<'any' | 'slots' | 'free'>('any')
const hideUnavailable = ref(false)
const sort = ref<'slot' | 'title'>('slot')
const view = ref<'grid' | 'list'>('grid')
const filtersOpen = ref(false)
const selected = ref<BookingObject | null>(null)
const modalOpen = ref(false)
const openObject = (o: BookingObject) => {
  selected.value = o
  modalOpen.value = true
}
const chipsEl = ref<HTMLElement>()
const drawerWidth = computed(() => Math.min(400, window.innerWidth))

const durations = [
  { label: 'Любая', value: 0 },
  { label: '15 мин', value: 15 },
  { label: '30 мин', value: 30 },
  { label: '1 ч', value: 60 },
  { label: '5 ч', value: 300 },
  { label: '12 ч', value: 720 },
  { label: '24 ч', value: 1440 },
]
const bookingTypes = [
  { label: 'Любой', value: 'any' },
  { label: 'Слоты', value: 'slots' },
  { label: 'Свободный', value: 'free' },
]
const viewOptions = [
  { value: 'grid', label: h(AppstoreOutlined), title: 'Плитка' },
  { value: 'list', label: h(BarsOutlined), title: 'Список' },
]
const sortOptions = [
  { label: 'по ближайшим слотам', value: 'slot' },
  { label: 'по названию', value: 'title' },
]

async function load() {
  loading.value = true
  try {
    if (!categories.value.length) categories.value = await fetchCategories()
    items.value = await fetchObjects(categoryId.value)
  } finally {
    loading.value = false
  }
}
watch(categoryId, load, { immediate: true })

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = items.value.filter(
    (o) =>
      (!q || o.title.toLowerCase().includes(q)) &&
      (!duration.value || o.minDuration <= duration.value) &&
      (bookingType.value === 'any' || o.bookingType === bookingType.value) &&
      (!hideUnavailable.value || o.available),
  )
  return sort.value === 'title' ? [...list].sort((a, b) => a.title.localeCompare(b.title, 'ru')) : list
})

const activeFilters = computed(
  () =>
    [startAt.value, duration.value, bookingType.value !== 'any', hideUnavailable.value].filter(Boolean)
      .length,
)
const hasFilters = computed(() => activeFilters.value > 0 || !!query.value)

const resetFilters = () => {
  query.value = ''
  startAt.value = undefined
  duration.value = 0
  bookingType.value = 'any'
  hideUnavailable.value = false
}

// выбранный чип всегда в зоне видимости
watch([categoryId, categories], async () => {
  await nextTick()
  chipsEl.value?.querySelector('.chip.active')?.scrollIntoView({ inline: 'center', block: 'nearest' })
})

const goBack = () => (window.history.state?.back ? router.back() : router.push({ name: 'categories' }))
const selectCategory = (id: string | number) => router.replace({ name: 'showcase', params: { id: String(id) } })

</script>

<template>
  <main class="page">
    <a-breadcrumb class="breadcrumb">
      <a-breadcrumb-item><router-link to="/">Главная</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{ name: 'categories' }">Бронирование</router-link></a-breadcrumb-item>
      <a-breadcrumb-item>Каталог</a-breadcrumb-item>
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

    <section class="panel">
      <a-tabs :active-key="categoryId" @change="selectCategory">
        <a-tab-pane v-for="c in categories" :key="c.id" :tab="c.title" />
        <template #rightExtra>
          <a-segmented v-model:value="view" class="views" :options="viewOptions" />
        </template>
      </a-tabs>

      <div class="category-bar">
        <div ref="chipsEl" class="chips" role="radiogroup" aria-label="Категория">
          <button
            v-for="c in categories"
            :key="c.id"
            type="button"
            role="radio"
            class="chip"
            :class="{ active: c.id === categoryId }"
            :aria-checked="c.id === categoryId"
            @click="selectCategory(c.id)"
          >
            {{ c.title }}
          </button>
        </div>
        <a-segmented v-model:value="view" class="views" :options="viewOptions" />
      </div>

      <div class="row toolbar-row">
        <div class="group search-group">
        <a-input v-model:value="query" class="search" allow-clear placeholder="Поиск по названию">
          <template #prefix><SearchOutlined /></template>
        </a-input>
        <a-badge :dot="activeFilters > 0" color="blue">
          <a-button aria-label="Фильтры" title="Фильтры" @click="filtersOpen = true">
            <template #icon><FilterFilled /></template>
          </a-button>
        </a-badge>
        <a-button v-if="hasFilters" type="link" class="reset" @click="resetFilters">Сбросить</a-button>
        </div>
        <div class="spacer" />
        <span class="found found-top">Найдено объектов: {{ filtered.length }}</span>
        <div class="group sort-group">
        <div class="sort">
          Сортировка:
          <a-dropdown :trigger="['click']">
            <a-button type="link" class="sort-trigger">
              {{ sortOptions.find((o) => o.value === sort)?.label }}
              <DownOutlined class="sort-arrow" />
            </a-button>
            <template #overlay>
              <a-menu :selected-keys="[sort]" @click="({ key }) => (sort = key as typeof sort)">
                <a-menu-item v-for="o in sortOptions" :key="o.value">{{ o.label }}</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        </div>
      </div>


      <div class="row quick-filters">
        <div class="quick-fields">
        <label class="field">
          Дата и время начала:
          <a-date-picker
            v-model:value="startAt"
            :format="startAtFormats"
            :show-time="{ format: 'HH:mm' }"
            :disabled-date="disabledPastDays"
            placeholder="Выберите дату и время"
          />
        </label>
        <div class="field">
          Длительность от:
          <a-radio-group v-model:value="duration" option-type="button" :options="durations" />
        </div>
        <div class="field">
          Тип брони:
          <a-radio-group v-model:value="bookingType" option-type="button" :options="bookingTypes" />
        </div>
        </div>
        <div class="quick-meta">
          <a-checkbox v-model:checked="hideUnavailable">Скрывать недоступные</a-checkbox>
          <span class="found found-quick">Найдено объектов: {{ filtered.length }}</span>
        </div>
      </div>
    </section>

    <ObjectModal v-model:open="modalOpen" :item="selected" />

    <a-drawer v-model:open="filtersOpen" title="Фильтры" placement="right" :width="drawerWidth">
      <div class="drawer-form">
        <label class="field">
          Дата и время начала
          <a-date-picker
            v-model:value="startAt"
            :format="startAtFormats"
            :show-time="{ format: 'HH:mm' }"
            :disabled-date="disabledPastDays"
            placeholder="Выберите дату и время"
            style="width: 100%"
          />
        </label>
        <div class="field">
          Длительность от
          <a-radio-group v-model:value="duration" class="radio-list">
            <a-radio v-for="d in durations" :key="d.value" :value="d.value">{{ d.label }}</a-radio>
          </a-radio-group>
        </div>
        <div class="field">
          Тип брони
          <a-radio-group v-model:value="bookingType" class="radio-fill" option-type="button" :options="bookingTypes" />
        </div>
        <a-checkbox v-model:checked="hideUnavailable">Скрывать недоступные</a-checkbox>
      </div>
      <template #footer>
        <div class="drawer-footer">
          <a-button @click="resetFilters">Сбросить</a-button>
          <a-button type="primary" @click="filtersOpen = false">Показать ({{ filtered.length }})</a-button>
        </div>
      </template>
    </a-drawer>

    <a-spin :spinning="loading">
      <div v-if="view === 'grid' && filtered.length" class="grid">
        <ObjectCard v-for="o in filtered" :key="o.id" :item="o" @click="openObject(o)" />
      </div>
      <div v-else-if="view === 'list' && filtered.length" class="list">
        <ObjectCard v-for="o in filtered" :key="o.id" :item="o" layout="list" @click="openObject(o)" />
      </div>
      <a-empty v-else-if="!loading" description="Объекты не найдены">
        <a-button @click="resetFilters">Сбросить фильтры</a-button>
      </a-empty>
    </a-spin>
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
.title {
  flex: 1;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  color: rgba(0, 0, 0, 0.88);
}
.panel {
  padding: 0 0 12px;
  background: #fff;
  border-radius: 8px;
}
/* вкладка 46px: центр на 32px от верха = 16px (отступ) + половина переключателя (16px) */
.panel :deep(.ant-tabs-nav) {
  padding: 9px 16px 0;
}
.panel :deep(.ant-tabs-extra-content) {
  align-self: flex-start;
  margin-top: 7px;
  margin-left: 8px;
}
.category-bar {
  display: none;
}
.chips {
  display: flex;
  flex: 1;
  gap: 8px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 24px), transparent);
  mask-image: linear-gradient(to right, #000 calc(100% - 24px), transparent);
}
.chips::-webkit-scrollbar {
  display: none;
}
.chip {
  flex: none;
  min-height: 32px;
  padding: 0 12px;
  font: inherit;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.88);
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 16px;
  transition: border-color 0.2s, color 0.2s, background-color 0.2s;
}
.chip.active {
  color: #1677ff;
  background: #e6f4ff;
  border-color: #1677ff;
}
.chip:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: 2px;
}
.row {
  padding: 0 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
  margin-top: 8px;
}
.search {
  height: 32px;
  width: 280px;
}
.reset {
  padding-right: 0;
  padding-left: 0;
  margin-left: 8px;
}
.quick-filters {
  margin-top: 12px;
}
.group {
  display: flex;
  gap: 8px;
  align-items: center;
}
.spacer {
  flex: 1;
}
.sort {
  display: flex;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
}
.sort-trigger {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  width: 180px;
  padding: 0 0 0 8px;
  font-size: inherit;
  line-height: inherit;
}
.sort-arrow {
  font-size: 10px;
}
.field {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 14px;
  white-space: nowrap;
}
.quick-fields :deep(.ant-picker) {
  height: 32px;
}
.quick-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
}
.found-top {
  display: none;
}
.quick-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.found-quick {
  margin-left: auto;
}
.found {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 8px;
}
/* планшеты: ровно две колонки */
@media (min-width: 561px) and (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.back {
  width: 32px;
  height: 32px;
  padding: 0;
}
.drawer-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.drawer-form .field {
  flex-direction: column;
  align-items: flex-start;
  white-space: normal;
}
.drawer-form .field:has(.radio-fill) {
  align-items: stretch;
}
.radio-fill {
  display: flex;
  width: 100%;
}
.radio-fill :deep(.ant-radio-button-wrapper) {
  flex: 1;
  text-align: center;
}
.radio-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.drawer-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
@media (max-width: 768px) {
  .panel > :deep(.ant-tabs) {
    display: none;
  }
  .panel {
    display: flex;
    flex-direction: column;
  }
  /* на телефоне порядок: поиск и фильтр → категории → сортировка → счётчик */
  .toolbar-row {
    display: contents;
  }
  .search-group {
    order: 1;
    padding: 16px 16px 0;
  }
  .sort-group {
    order: 3;
    padding: 12px 16px 0;
  }
  .category-bar {
    display: flex;
    order: 2;
    gap: 8px;
    align-items: center;
    padding: 12px 16px 0;
  }
  .category-bar .views {
    flex: none;
  }
  .quick-filters {
    display: none;
  }
  .found-top {
    display: block;
    order: 4;
    padding: 8px 16px 0;
  }
  .search {
    flex: 1;
    width: auto;
    min-width: 160px;
  }
  .spacer {
    display: none;
  }
}
@media (max-width: 560px) {
  .back {
    display: none;
  }
  .page {
    gap: 16px;
    padding: 12px 16px 24px;
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
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
