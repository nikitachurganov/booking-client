<script setup>
import { computed, onMounted, ref } from 'vue';
import {
  fetchBookingObjects,
  getBookingObjectsFilterOptions,
} from '../../services/bookingObjectsService';
import BookingObjectsFilters from './BookingObjectsFilters.vue';
import BookingObjectsGrid from './BookingObjectsGrid.vue';
import BookingObjectStatusTag from './BookingObjectStatusTag.vue';

const defaultFilters = {
  search: '',
  date: undefined,
  time: undefined,
  duration: 2,
  category: undefined,
  type: undefined,
  location: undefined,
  service: undefined,
  availability: undefined,
  onlyAvailable: false,
  hasRequiredDocuments: false,
  requiresInstruction: false,
  requiresModeration: false,
  requiresCheckIn: false,
  requiresCheckOut: false,
  collectiveBooking: false,
  withSubAssets: false,
  sort: 'availableFirst',
};

const objects = ref([]);
const isLoading = ref(true);
const loadError = ref('');
const selectedObject = ref(null);
const isDetailsOpen = ref(false);
const isFiltersOpen = ref(false);
const isDateTimeOpen = ref(false);
const filters = ref({ ...defaultFilters });
const activeSection = ref('catalog');

const sectionOptions = [
  { label: 'Каталог', value: 'catalog' },
  { label: 'Мои заявки', value: 'requests' },
  { label: 'Мои бронирования', value: 'bookings' },
];

const durationOptions = [
  { label: '30 минут', value: 0.5 },
  { label: '1 час', value: 1 },
  { label: '2 часа', value: 2 },
  { label: '3 часа', value: 3 },
  { label: 'День', value: 8 },
];

const sortOptions = [
  { label: 'Сначала доступные', value: 'availableFirst' },
  { label: 'Ближайший свободный слот', value: 'nearestSlot' },
  { label: 'По названию', value: 'title' },
];

const filterOptions = computed(() => getBookingObjectsFilterOptions(objects.value));

const enrichedObjects = computed(() =>
  objects.value.map((object) => ({
    ...object,
    ...getCatalogAvailability(object, filters.value),
  })),
);

const filteredObjects = computed(() => {
  if (activeSection.value !== 'catalog') {
    return [];
  }

  const search = filters.value.search.trim().toLowerCase();

  const filtered = enrichedObjects.value.filter((object) => {
    const searchFields = [
      object.title,
      object.description,
      object.type,
      object.category,
      object.location,
      object.room,
      object.department,
      ...object.services,
      ...object.assets,
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch = !search || searchFields.includes(search);
    const matchesCategory = !filters.value.category || object.category === filters.value.category;
    const matchesType = !filters.value.type || object.type === filters.value.type;
    const matchesLocation = !filters.value.location || object.location === filters.value.location;
    const matchesService =
      !filters.value.service || object.services.includes(filters.value.service);
    const matchesAvailability =
      !filters.value.availability || object.catalogStatus === filters.value.availability;
    const matchesOnlyAvailable =
      !filters.value.onlyAvailable || object.catalogStatus === 'available';
    const matchesDocuments =
      !filters.value.hasRequiredDocuments || object.requiresDocuments;
    const matchesInstruction =
      !filters.value.requiresInstruction || object.requiresInstruction;
    const matchesModeration =
      !filters.value.requiresModeration || object.moderationRequired;
    const matchesCheckIn = !filters.value.requiresCheckIn || object.requiresCheckIn;
    const matchesCheckOut = !filters.value.requiresCheckOut || object.requiresCheckOut;
    const matchesCollective =
      !filters.value.collectiveBooking || object.collectiveBooking;
    const matchesSubAssets = !filters.value.withSubAssets || object.subAssetsCount > 0;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesType &&
      matchesLocation &&
      matchesService &&
      matchesAvailability &&
      matchesOnlyAvailable &&
      matchesDocuments &&
      matchesInstruction &&
      matchesModeration &&
      matchesCheckIn &&
      matchesCheckOut &&
      matchesCollective &&
      matchesSubAssets
    );
  });

  return sortObjects(filtered, filters.value.sort);
});

const hasActiveFilters = computed(() =>
  Boolean(
    filters.value.search ||
      filters.value.date ||
      filters.value.time ||
      filters.value.duration !== defaultFilters.duration ||
      filters.value.category ||
      filters.value.type ||
      filters.value.location ||
      filters.value.service ||
      filters.value.availability ||
      filters.value.onlyAvailable ||
      filters.value.hasRequiredDocuments ||
      filters.value.requiresInstruction ||
      filters.value.requiresModeration ||
      filters.value.requiresCheckIn ||
      filters.value.requiresCheckOut ||
      filters.value.collectiveBooking ||
      filters.value.withSubAssets ||
      filters.value.sort !== defaultFilters.sort,
  ),
);

const activeFilterTags = computed(() => {
  const tags = [];

  if (filters.value.search) tags.push({ key: 'search', label: `Поиск: ${filters.value.search}` });
  if (filters.value.date || filters.value.time) tags.push({ key: 'dateTime', label: dateTimeLabel.value });
  if (filters.value.location) tags.push({ key: 'location', label: filters.value.location });
  if (filters.value.category) tags.push({ key: 'category', label: filters.value.category });
  if (filters.value.onlyAvailable) tags.push({ key: 'onlyAvailable', label: 'Только доступные' });
  if (filters.value.type) tags.push({ key: 'type', label: filters.value.type });
  if (filters.value.service) tags.push({ key: 'service', label: filters.value.service });
  if (filters.value.availability) tags.push({ key: 'availability', label: `Статус: ${formatStatus(filters.value.availability)}` });
  if (filters.value.hasRequiredDocuments) tags.push({ key: 'hasRequiredDocuments', label: 'Нужны документы' });
  if (filters.value.requiresInstruction) tags.push({ key: 'requiresInstruction', label: 'Требуется ознакомление' });
  if (filters.value.requiresModeration) tags.push({ key: 'requiresModeration', label: 'Требуется подтверждение' });
  if (filters.value.requiresCheckIn) tags.push({ key: 'requiresCheckIn', label: 'Требуется check-in' });
  if (filters.value.requiresCheckOut) tags.push({ key: 'requiresCheckOut', label: 'Требуется check-out' });
  if (filters.value.collectiveBooking) tags.push({ key: 'collectiveBooking', label: 'Коллективное бронирование' });
  if (filters.value.withSubAssets) tags.push({ key: 'withSubAssets', label: 'Есть оборудование внутри' });

  return tags;
});

const advancedFiltersCount = computed(() =>
  [
    filters.value.type,
    filters.value.service,
    filters.value.availability,
    filters.value.hasRequiredDocuments,
    filters.value.requiresInstruction,
    filters.value.requiresModeration,
    filters.value.requiresCheckIn,
    filters.value.requiresCheckOut,
    filters.value.collectiveBooking,
    filters.value.withSubAssets,
  ].filter(Boolean).length,
);

const dateTimeLabel = computed(() => {
  if (!filters.value.date && !filters.value.time) {
    return 'Дата и время';
  }

  const date = filters.value.date ? formatDate(filters.value.date) : 'Дата не выбрана';
  const start = filters.value.time || 'время не выбрано';
  const end = filters.value.time ? addHours(filters.value.time, filters.value.duration) : '';

  return end ? `${date}, ${start}-${end}` : `${date}, ${start}`;
});

const foundText = computed(() => {
  if (!filteredObjects.value.length) {
    return 'Ничего не найдено';
  }

  return `Найдено объектов: ${filteredObjects.value.length}`;
});

const emptyDescription = computed(() =>
  activeSection.value === 'catalog'
    ? 'Попробуйте изменить параметры поиска или сбросить фильтры.'
    : 'Здесь появятся ваши заявки и бронирования.',
);

const selectedObjectDocuments = computed(() =>
  selectedObject.value?.documents.length
    ? selectedObject.value.documents
    : ['Документы не требуются'],
);

onMounted(async () => {
  try {
    objects.value = await fetchBookingObjects();
  } catch (error) {
    loadError.value = 'Не удалось загрузить объекты бронирования';
  } finally {
    isLoading.value = false;
  }
});

function resetFilters() {
  filters.value = { ...defaultFilters };
}

function resetDateTime() {
  filters.value = {
    ...filters.value,
    date: defaultFilters.date,
    time: defaultFilters.time,
    duration: defaultFilters.duration,
  };
}

function clearFilter(key) {
  if (key === 'dateTime') {
    resetDateTime();
    return;
  }

  filters.value = {
    ...filters.value,
    [key]: defaultFilters[key],
  };
}

function openDetails(object) {
  selectedObject.value = object;
  isDetailsOpen.value = true;
}

function handleBook(object) {
  selectedObject.value = object;
  isDetailsOpen.value = true;
}

function updateFilter(key, value) {
  filters.value = {
    ...filters.value,
    [key]: value,
  };
}

function applyDateTime() {
  isDateTimeOpen.value = false;
}

function getCatalogAvailability(object, currentFilters) {
  const matchingSlot = findMatchingSlot(object.slots, currentFilters);
  const nextSlot = findNextSlot(object.slots);
  const hasSelectedDateTime = Boolean(currentFilters.date && currentFilters.time);
  const isOutOfService = object.slots.length === 0;

  let catalogStatus = 'available';
  let availabilityLabel = nextSlot ? formatSlot(nextSlot) : 'Нет доступных слотов';
  const slotCaption = hasSelectedDateTime ? 'Выбранное время' : 'Ближайший слот';
  let canBook = Boolean(nextSlot);
  let actionLabel = 'Выбрать слот';

  if (isOutOfService) {
    catalogStatus = 'unavailable';
    availabilityLabel = 'Временно недоступно';
    canBook = false;
    actionLabel = 'Подробнее';
  } else if (hasSelectedDateTime && !matchingSlot) {
    catalogStatus = 'noSlots';
    availabilityLabel = 'Нет слотов на выбранное время';
    canBook = false;
    actionLabel = 'Посмотреть слоты';
  } else if (object.restrictedAccess) {
    catalogStatus = 'restricted';
    canBook = false;
    actionLabel = 'Подробнее';
  } else if (object.moderationRequired) {
    catalogStatus = 'moderation';
    canBook = Boolean(matchingSlot || nextSlot);
    actionLabel = hasSelectedDateTime && matchingSlot ? 'Отправить заявку' : 'Выбрать слот';
  } else if (object.requiresDocuments) {
    catalogStatus = 'documents';
    canBook = Boolean(matchingSlot || nextSlot);
    actionLabel = hasSelectedDateTime && matchingSlot ? 'Забронировать' : 'Выбрать слот';
  } else if (matchingSlot) {
    availabilityLabel = formatSlot(matchingSlot);
    actionLabel = 'Забронировать';
  }

  return {
    matchingSlot,
    nextSlot,
    catalogStatus,
    availabilityLabel,
    slotCaption,
    canBook,
    actionLabel,
  };
}

function findMatchingSlot(slots, currentFilters) {
  if (!currentFilters.date || !currentFilters.time) {
    return undefined;
  }

  const requestedStart = timeToMinutes(currentFilters.time);
  const requestedEnd = requestedStart + currentFilters.duration * 60;

  return slots.find((slot) => {
    const slotStart = timeToMinutes(slot.start);
    const slotEnd = timeToMinutes(slot.end);

    return (
      slot.available &&
      slot.date === currentFilters.date &&
      slotStart <= requestedStart &&
      slotEnd >= requestedEnd
    );
  });
}

function findNextSlot(slots) {
  return slots.find((slot) => slot.available);
}

function sortObjects(items, sortKey) {
  const sorted = [...items];

  if (sortKey === 'title') {
    return sorted.sort((left, right) => left.title.localeCompare(right.title, 'ru'));
  }

  if (sortKey === 'nearestSlot') {
    return sorted.sort((left, right) => getSlotScore(left.nextSlot) - getSlotScore(right.nextSlot));
  }

  return sorted.sort((left, right) => {
    const statusDiff = getStatusRank(left.catalogStatus) - getStatusRank(right.catalogStatus);

    if (statusDiff !== 0) {
      return statusDiff;
    }

    return getSlotScore(left.nextSlot) - getSlotScore(right.nextSlot);
  });
}

function getStatusRank(status) {
  const ranks = {
    available: 0,
    documents: 1,
    moderation: 2,
    noSlots: 3,
    restricted: 4,
    unavailable: 5,
  };

  return ranks[status] ?? 10;
}

function getSlotScore(slot) {
  if (!slot) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Number(`${slot.date.replaceAll('-', '')}${slot.start.replace(':', '')}`);
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function addHours(time, duration) {
  const totalMinutes = timeToMinutes(time) + duration * 60;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatSlot(slot) {
  return `${formatDate(slot.date)}, ${slot.start}-${slot.end}`;
}

function formatDate(date) {
  const [, month, day] = date.split('-');
  return `${day}.${month}`;
}

function formatStatus(status) {
  const labels = {
    available: 'Доступно',
    noSlots: 'Нет слотов',
    moderation: 'Требуется подтверждение',
    restricted: 'Доступ ограничен',
    documents: 'Нужны документы',
    unavailable: 'Недоступно',
  };

  return labels[status] ?? status;
}
</script>

<template>
  <div class="catalog-page">
    <header class="catalog-header">
      <div class="catalog-header__brand">
        <div class="catalog-header__logo" aria-hidden="true">
          <span>✓</span>
        </div>
        <strong>FEFUone</strong>
      </div>

      <a-breadcrumb class="catalog-header__breadcrumbs">
        <a-breadcrumb-item>Сервисы</a-breadcrumb-item>
        <a-breadcrumb-item>Бронирование</a-breadcrumb-item>
      </a-breadcrumb>

      <a-button shape="circle" aria-label="Профиль пользователя">Я</a-button>
    </header>

    <main class="catalog-main">
      <section class="catalog-content-header" aria-labelledby="catalog-title">
        <div class="catalog-title-block">
          <div>
            <a-typography-title id="catalog-title" :level="4">
              Объекты бронирования
            </a-typography-title>
            <a-typography-paragraph type="secondary">
              Найдите объект, проверьте доступность на нужное время и перейдите к бронированию.
            </a-typography-paragraph>
          </div>

          <a-segmented v-model:value="activeSection" :options="sectionOptions" />
        </div>
      </section>

      <section class="catalog-layout">
        <div class="catalog-results">
          <a-card class="catalog-quick-toolbar" :body-style="{ padding: '12px' }">
            <div class="catalog-quick-toolbar__main">
              <a-input-search
                class="catalog-quick-toolbar__search"
                :value="filters.search"
                allow-clear
                aria-label="Поиск по объектам бронирования"
                placeholder="Найти объект, услугу или оборудование"
                @input="(event) => updateFilter('search', event.target.value)"
                @change="(event) => updateFilter('search', event.target.value)"
                @search="(value) => updateFilter('search', value)"
              />

              <a-popover
                v-model:open="isDateTimeOpen"
                trigger="click"
                placement="bottom"
                overlay-class-name="catalog-date-popover"
              >
                <template #content>
                  <a-space direction="vertical" :size="12" class="catalog-date-popover__content">
                    <label class="catalog-filter-field">
                      <span>Дата</span>
                      <a-date-picker
                        :value="filters.date"
                        value-format="YYYY-MM-DD"
                        format="DD.MM.YYYY"
                        placeholder="Выберите дату"
                        @change="(value) => updateFilter('date', value)"
                      />
                    </label>

                    <label class="catalog-filter-field">
                      <span>Время начала</span>
                      <a-time-picker
                        :value="filters.time"
                        value-format="HH:mm"
                        format="HH:mm"
                        placeholder="Выберите время"
                        :minute-step="30"
                        @change="(value) => updateFilter('time', value)"
                      />
                    </label>

                    <label class="catalog-filter-field">
                      <span>Длительность</span>
                      <a-select
                        :value="filters.duration"
                        @change="(value) => updateFilter('duration', value)"
                      >
                        <a-select-option
                          v-for="option in durationOptions"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </a-select-option>
                      </a-select>
                    </label>

                    <div class="catalog-date-popover__actions">
                      <a-button @click="resetDateTime">Сбросить</a-button>
                      <a-button type="primary" @click="applyDateTime">Применить</a-button>
                    </div>
                  </a-space>
                </template>

                <a-button class="catalog-date-button">
                  {{ dateTimeLabel }}
                </a-button>
              </a-popover>

              <a-select
                class="catalog-quick-toolbar__select"
                :value="filters.location"
                allow-clear
                placeholder="Локация"
                @change="(value) => updateFilter('location', value)"
              >
                <a-select-option
                  v-for="location in filterOptions.locations"
                  :key="location"
                  :value="location"
                >
                  {{ location }}
                </a-select-option>
              </a-select>

              <a-select
                class="catalog-quick-toolbar__select"
                :value="filters.category"
                allow-clear
                placeholder="Категория"
                @change="(value) => updateFilter('category', value)"
              >
                <a-select-option
                  v-for="category in filterOptions.categories"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
                </a-select-option>
              </a-select>

              <a-tooltip
                :title="
                  !filters.date || !filters.time
                    ? 'Выберите дату и время, чтобы проверить точную доступность'
                    : ''
                "
              >
                <a-checkbox
                  class="catalog-available-checkbox"
                  :checked="filters.onlyAvailable"
                  @change="(event) => updateFilter('onlyAvailable', event.target.checked)"
                >
                  Только доступные
                </a-checkbox>
              </a-tooltip>

              <a-badge :count="advancedFiltersCount">
                <a-button @click="isFiltersOpen = true">Все фильтры</a-button>
              </a-badge>
            </div>

            <div v-if="activeFilterTags.length" class="catalog-quick-toolbar__tags">
              <a-space wrap :size="[6, 6]">
                <a-tag
                  v-for="tag in activeFilterTags"
                  :key="tag.key"
                  closable
                  @close.prevent="clearFilter(tag.key)"
                >
                  {{ tag.label }}
                </a-tag>
                <a-button type="link" size="small" @click="resetFilters">Сбросить всё</a-button>
              </a-space>
            </div>

            <div class="catalog-quick-toolbar__meta">
              <a-typography-text type="secondary">{{ foundText }}</a-typography-text>
              <a-space :size="8">
                <a-typography-text type="secondary">Сортировка:</a-typography-text>
                <a-select
                  class="catalog-sort-select"
                  :value="filters.sort"
                  @change="(value) => updateFilter('sort', value)"
                >
                  <a-select-option
                    v-for="option in sortOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </a-select-option>
                </a-select>
              </a-space>
            </div>
          </a-card>

          <a-alert
            v-if="loadError"
            class="catalog-alert"
            type="error"
            show-icon
            :message="loadError"
            description="Обновите страницу или повторите запрос позже."
          />

          <BookingObjectsGrid
            v-else
            :objects="filteredObjects"
            :loading="isLoading"
            :empty-description="emptyDescription"
            :show-reset="hasActiveFilters"
            @open="openDetails"
            @book="handleBook"
            @reset="resetFilters"
          />
        </div>
      </section>
    </main>

    <a-drawer
      v-model:open="isFiltersOpen"
      width="360"
      title="Все фильтры"
      placement="right"
    >
      <BookingObjectsFilters
        v-model="filters"
        :filter-options="filterOptions"
        :result-count="filteredObjects.length"
        @reset="resetFilters"
      />
    </a-drawer>

    <a-drawer
      v-model:open="isDetailsOpen"
      width="520"
      :title="selectedObject?.title"
      placement="right"
      class="catalog-drawer"
    >
      <template v-if="selectedObject">
        <img
          class="catalog-drawer__image"
          :src="selectedObject.imageUrl"
          :alt="selectedObject.title"
        />

        <a-space direction="vertical" :size="16" class="catalog-drawer__content">
          <a-space wrap>
            <BookingObjectStatusTag :status="selectedObject.catalogStatus" />
            <a-tag color="blue">{{ selectedObject.category }}</a-tag>
            <a-tag>{{ selectedObject.type }}</a-tag>
          </a-space>

          <a-alert
            v-if="selectedObject.catalogStatus !== 'available'"
            type="info"
            show-icon
            :message="selectedObject.availabilityLabel"
            description="Можно посмотреть ближайшие слоты или уточнить условия у ответственного."
          />

          <a-typography-paragraph>
            {{ selectedObject.description }}
          </a-typography-paragraph>

          <a-descriptions :column="1" size="small" bordered>
            <a-descriptions-item label="Локация">
              {{ selectedObject.location }}, {{ selectedObject.room }}
            </a-descriptions-item>
            <a-descriptions-item label="Доступность">
              {{ selectedObject.availabilityLabel }}
            </a-descriptions-item>
            <a-descriptions-item label="Услуги">
              <a-space wrap :size="[4, 4]">
                <a-tag v-for="service in selectedObject.services" :key="service">
                  {{ service }}
                </a-tag>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="Оборудование внутри">
              <a-space wrap :size="[4, 4]">
                <a-tag v-for="asset in selectedObject.assets" :key="asset">
                  {{ asset }}
                </a-tag>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="Документы">
              <a-space wrap :size="[4, 4]">
                <a-tag v-for="document in selectedObjectDocuments" :key="document">
                  {{ document }}
                </a-tag>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="Условия">
              <a-space wrap :size="[4, 4]">
                <a-tag v-if="selectedObject.requiresDocuments">Нужны документы</a-tag>
                <a-tag v-if="selectedObject.requiresInstruction">Нужен инструктаж</a-tag>
                <a-tag v-if="selectedObject.moderationRequired">Требуется подтверждение</a-tag>
                <a-tag v-if="selectedObject.restrictedAccess" color="red">Доступ ограничен</a-tag>
                <a-tag v-if="selectedObject.requiresCheckIn">Check-in</a-tag>
                <a-tag v-if="selectedObject.requiresCheckOut">Check-out</a-tag>
                <a-tag v-if="selectedObject.collectiveBooking">Коллективное бронирование</a-tag>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="Ответственный">
              {{ selectedObject.contactPerson }}
            </a-descriptions-item>
            <a-descriptions-item label="Модератор">
              {{ selectedObject.moderator }}
            </a-descriptions-item>
          </a-descriptions>

          <a-card class="catalog-drawer__slots" :body-style="{ padding: '12px' }">
            <a-typography-title :level="5">Ближайшие слоты</a-typography-title>
            <a-list size="small" :data-source="selectedObject.slots.filter((slot) => slot.available)">
              <template #renderItem="{ item }">
                <a-list-item>
                  <span>{{ formatSlot(item) }}</span>
                  <a-tag color="success">Можно выбрать</a-tag>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </a-space>
      </template>

      <template #footer>
        <div class="catalog-drawer__footer">
          <a-button @click="isDetailsOpen = false">Закрыть</a-button>
          <a-button
            type="primary"
            :disabled="!selectedObject?.canBook"
          >
            {{ selectedObject?.actionLabel ?? 'Выбрать слот' }}
          </a-button>
        </div>
      </template>
    </a-drawer>
  </div>
</template>
