<script setup>
import { computed, onMounted, ref } from 'vue';
import { FilterFilled } from '@ant-design/icons-vue';
import {
  fetchBookingObjects,
  getBookingObjectsFilterOptions,
} from '../../services/bookingObjectsService';
import BookingObjectsFilters from './BookingObjectsFilters.vue';
import BookingObjectsGrid from './BookingObjectsGrid.vue';
import BookingObjectStatusTag from './BookingObjectStatusTag.vue';

const defaultFilters = {
  search: '',
  dateRange: undefined,
  timeRange: undefined,
  durationRange: undefined,
  category: undefined,
  type: undefined,
  location: undefined,
  service: undefined,
  availability: undefined,
  hasRequiredDocuments: false,
  requiresInstruction: false,
  requiresModeration: false,
  requiresCheckIn: false,
  requiresCheckOut: false,
  collectiveBooking: false,
  withSubAssets: false,
};

const objects = ref([]);
const isLoading = ref(true);
const loadError = ref('');
const selectedObject = ref(null);
const selectedDocumentsObject = ref(null);
const isDetailsOpen = ref(false);
const isDocumentsOpen = ref(false);
const isFiltersOpen = ref(false);
const isCustomDateOpen = ref(false);
const isCustomTimeOpen = ref(false);
const isCustomDurationOpen = ref(false);
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

const datePresetOptions = [
  { label: 'Любая', value: 'any' },
  { label: 'Сегодня', value: 'today' },
  { label: 'Завтра', value: 'tomorrow' },
  { label: 'На выходных', value: 'weekend' },
];

const timePresetOptions = [
  { label: 'Любое', value: 'any', range: undefined },
  { label: 'Утро', value: 'morning', range: ['08:00', '12:00'] },
  { label: 'День', value: 'day', range: ['12:00', '18:00'] },
  { label: 'Вечер', value: 'evening', range: ['18:00', '22:00'] },
];

const durationPresetOptions = [
  { label: 'Любая', value: 'any', range: undefined },
  { label: 'До 1 часа', value: 'short', range: [undefined, 1] },
  { label: '1-3 часа', value: 'medium', range: [1, 3] },
  { label: 'День', value: 'day', range: [8, 8] },
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
      matchesDocuments &&
      matchesInstruction &&
      matchesModeration &&
      matchesCheckIn &&
      matchesCheckOut &&
      matchesCollective &&
      matchesSubAssets
    );
  });

  return sortObjects(filtered);
});

const hasActiveFilters = computed(() =>
  Boolean(
    filters.value.search ||
      hasRangeValue(filters.value.dateRange) ||
      hasRangeValue(filters.value.timeRange) ||
      hasRangeValue(filters.value.durationRange) ||
      filters.value.category ||
      filters.value.type ||
      filters.value.location ||
      filters.value.service ||
      filters.value.availability ||
      filters.value.hasRequiredDocuments ||
      filters.value.requiresInstruction ||
      filters.value.requiresModeration ||
      filters.value.requiresCheckIn ||
      filters.value.requiresCheckOut ||
      filters.value.collectiveBooking ||
      filters.value.withSubAssets,
  ),
);

const advancedFiltersCount = computed(() =>
  [
    filters.value.timeRange,
    filters.value.durationRange,
    filters.value.location,
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
  ].filter((value) => (Array.isArray(value) ? hasRangeValue(value) : Boolean(value))).length,
);

const datePreset = computed(() => {
  if (!hasRangeValue(filters.value.dateRange)) {
    return 'any';
  }

  const [startDate, endDate] = filters.value.dateRange;

  if (startDate === getTodayIsoDate() && endDate === getTodayIsoDate()) {
    return 'today';
  }

  if (startDate === getTomorrowIsoDate() && endDate === getTomorrowIsoDate()) {
    return 'tomorrow';
  }

  const [weekendStart, weekendEnd] = getWeekendDateRange();

  if (startDate === weekendStart && endDate === weekendEnd) {
    return 'weekend';
  }

  return 'custom';
});

const timePreset = computed(() => {
  if (!hasRangeValue(filters.value.timeRange)) {
    return 'any';
  }

  const option = timePresetOptions.find((item) => rangesEqual(item.range, filters.value.timeRange));
  return option?.value ?? 'custom';
});

const durationPreset = computed(() => {
  if (!hasRangeValue(filters.value.durationRange)) {
    return 'any';
  }

  const option = durationPresetOptions.find((item) => rangesEqual(item.range, filters.value.durationRange));
  return option?.value ?? 'custom';
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

const selectedDrawerDocuments = computed(() =>
  selectedDocumentsObject.value?.documents.length
    ? selectedDocumentsObject.value.documents
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

function openDetails(object) {
  selectedObject.value = object;
  isDetailsOpen.value = true;
}

function updateFilter(key, value) {
  filters.value = {
    ...filters.value,
    [key]: value,
  };
}

function updateRangeFilter(key, value) {
  filters.value = {
    ...filters.value,
    [key]: normalizeRange(value),
  };
}

function updateCustomDateRange(value) {
  updateRangeFilter('dateRange', value);
  isCustomDateOpen.value = false;
}

function updateCustomTimeRange(value) {
  updateRangeFilter('timeRange', value);
  isCustomTimeOpen.value = false;
}

function updateCustomDurationRange(index, value) {
  const nextRange = [...(filters.value.durationRange ?? [undefined, undefined])];
  nextRange[index] = value;

  filters.value = {
    ...filters.value,
    durationRange: normalizeRange(nextRange),
  };
}

function setDatePreset(value) {
  if (value === 'any') {
    updateFilter('dateRange', undefined);
    return;
  }

  if (value === 'today') {
    const today = getTodayIsoDate();
    updateFilter('dateRange', [today, today]);
    return;
  }

  if (value === 'tomorrow') {
    const tomorrow = getTomorrowIsoDate();
    updateFilter('dateRange', [tomorrow, tomorrow]);
    return;
  }

  if (value === 'weekend') {
    updateFilter('dateRange', getWeekendDateRange());
  }
}

function setTimePreset(option) {
  updateFilter('timeRange', option.range);
}

function setDurationPreset(option) {
  updateFilter('durationRange', option.range);
}

function openDocuments(object) {
  selectedDocumentsObject.value = object;
  isDocumentsOpen.value = true;
}

function getCatalogAvailability(object, currentFilters) {
  const matchingSlots = findMatchingSlots(object.slots, currentFilters);
  const matchingSlot = matchingSlots[0];
  const nextSlot = findNextSlot(object.slots);
  const hasTemporalFilters = hasTemporalFilter(currentFilters);
  const visibleSlot = hasTemporalFilters ? matchingSlot : nextSlot;
  const isOutOfService = object.slots.length === 0;
  const availableSlots = object.slots.filter((slot) => slot.available);
  const slotsForCount = hasTemporalFilters ? matchingSlots : availableSlots;

  let catalogStatus = 'available';
  let availabilityLabel = visibleSlot ? formatSlot(visibleSlot) : 'Нет доступных слотов';
  const slotCaption = hasTemporalFilters ? 'Подходящий слот' : 'Ближайший слот';
  const additionalSlotsCount = visibleSlot
    ? slotsForCount.filter((slot) => slot !== visibleSlot).length
    : 0;
  let canBook = Boolean(visibleSlot);
  let actionLabel = 'Выбрать слот';

  if (isOutOfService) {
    catalogStatus = 'unavailable';
    availabilityLabel = 'Временно недоступно';
    canBook = false;
    actionLabel = 'Подробнее';
  } else if (hasTemporalFilters && !matchingSlot) {
    catalogStatus = 'noSlots';
    availabilityLabel = 'Нет слотов в выбранном интервале';
    canBook = false;
    actionLabel = 'Посмотреть слоты';
  } else if (!nextSlot) {
    catalogStatus = 'noSlots';
    availabilityLabel = 'Нет доступных слотов';
    canBook = false;
    actionLabel = 'Посмотреть слоты';
  } else if (object.restrictedAccess) {
    catalogStatus = 'restricted';
    canBook = false;
    actionLabel = 'Подробнее';
  } else if (object.moderationRequired) {
    catalogStatus = 'moderation';
    canBook = Boolean(visibleSlot);
    actionLabel = hasTemporalFilters && matchingSlot ? 'Отправить заявку' : 'Выбрать слот';
  } else if (object.requiresDocuments) {
    catalogStatus = 'documents';
    canBook = Boolean(visibleSlot);
    actionLabel = hasTemporalFilters && matchingSlot ? 'Забронировать' : 'Выбрать слот';
  } else if (visibleSlot) {
    availabilityLabel = formatSlot(visibleSlot);
    actionLabel = hasTemporalFilters ? 'Забронировать' : 'Выбрать слот';
  }

  return {
    matchingSlot,
    matchingSlots,
    nextSlot,
    visibleSlot,
    additionalSlotsCount,
    catalogStatus,
    availabilityLabel,
    slotCaption,
    canBook,
    actionLabel,
  };
}

function findMatchingSlots(slots, currentFilters) {
  return slots
    .filter((slot) => slot.available && slotMatchesFilters(slot, currentFilters))
    .sort((left, right) => getSlotScore(left) - getSlotScore(right));
}

function findNextSlot(slots) {
  return [...slots]
    .filter((slot) => slot.available)
    .sort((left, right) => getSlotScore(left) - getSlotScore(right))[0];
}

function sortObjects(items) {
  return [...items].sort((left, right) => {
    const slotDiff = getSlotScore(left.visibleSlot) - getSlotScore(right.visibleSlot);

    if (slotDiff !== 0) {
      return slotDiff;
    }

    return left.title.localeCompare(right.title, 'ru');
  });
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

function slotMatchesFilters(slot, currentFilters) {
  return (
    slotMatchesDateRange(slot, currentFilters.dateRange) &&
    slotMatchesTimeRange(slot, currentFilters.timeRange) &&
    slotMatchesDurationRange(slot, currentFilters.durationRange)
  );
}

function slotMatchesDateRange(slot, dateRange) {
  if (!hasRangeValue(dateRange)) {
    return true;
  }

  const [startDate, endDate] = dateRange;

  return (!startDate || slot.date >= startDate) && (!endDate || slot.date <= endDate);
}

function slotMatchesTimeRange(slot, timeRange) {
  if (!hasRangeValue(timeRange)) {
    return true;
  }

  const [startTime, endTime] = timeRange;
  const slotStart = timeToMinutes(slot.start);
  const slotEnd = timeToMinutes(slot.end);
  const filterStart = startTime ? timeToMinutes(startTime) : undefined;
  const filterEnd = endTime ? timeToMinutes(endTime) : undefined;

  return (
    (filterStart === undefined || slotEnd > filterStart) &&
    (filterEnd === undefined || slotStart < filterEnd)
  );
}

function slotMatchesDurationRange(slot, durationRange) {
  if (!hasRangeValue(durationRange)) {
    return true;
  }

  const [minDuration, maxDuration] = durationRange;
  const slotDuration = (timeToMinutes(slot.end) - timeToMinutes(slot.start)) / 60;

  return (
    (minDuration === undefined || slotDuration >= minDuration) &&
    (maxDuration === undefined || slotDuration <= maxDuration)
  );
}

function hasTemporalFilter(currentFilters) {
  return (
    hasRangeValue(currentFilters.dateRange) ||
    hasRangeValue(currentFilters.timeRange) ||
    hasRangeValue(currentFilters.durationRange)
  );
}

function hasRangeValue(value) {
  return Array.isArray(value) && value.some((item) => item !== undefined && item !== null && item !== '');
}

function normalizeRange(value) {
  if (!Array.isArray(value) || !hasRangeValue(value)) {
    return undefined;
  }

  return [value[0] ?? undefined, value[1] ?? undefined];
}

function rangesEqual(leftRange, rightRange) {
  const left = normalizeRange(leftRange);
  const right = normalizeRange(rightRange);

  if (!left && !right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return left[0] === right[0] && left[1] === right[1];
}

function formatDateRange(dateRange) {
  const [startDate, endDate] = dateRange;

  if (startDate && endDate) {
    return `${formatShortDate(startDate)}-${formatShortDate(endDate)}`;
  }

  return startDate ? `с ${formatShortDate(startDate)}` : `до ${formatShortDate(endDate)}`;
}

function formatTimeRange(timeRange) {
  const [startTime, endTime] = timeRange;

  if (startTime && endTime) {
    return `${startTime}-${endTime}`;
  }

  return startTime ? `с ${startTime}` : `до ${endTime}`;
}

function formatDurationRange(durationRange) {
  const [minDuration, maxDuration] = durationRange;

  if (minDuration !== undefined && maxDuration !== undefined) {
    return `${getDurationLabel(minDuration)}-${getDurationLabel(maxDuration)}`;
  }

  return minDuration !== undefined
    ? `от ${getDurationLabel(minDuration)}`
    : `до ${getDurationLabel(maxDuration)}`;
}

function getDurationLabel(duration) {
  return durationOptions.find((option) => option.value === duration)?.label ?? `${duration} ч`;
}

function formatSlot(slot) {
  return `${formatDate(slot.date)}, ${slot.start}-${slot.end}`;
}

function formatShortDate(date) {
  const [, month, day] = date.split('-');
  return `${day}.${month}`;
}

function formatDate(date) {
  if (date === getTodayIsoDate()) {
    return 'Сегодня';
  }

  if (date === getTomorrowIsoDate()) {
    return 'Завтра';
  }

  return formatShortDate(date);
}

function getTodayIsoDate() {
  const today = new Date();
  return toIsoDate(today);
}

function getTomorrowIsoDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toIsoDate(tomorrow);
}

function getWeekendDateRange() {
  const today = new Date();
  const dayOfWeek = today.getDay();

  if (dayOfWeek === 0) {
    return [toIsoDate(today), toIsoDate(today)];
  }

  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  const saturday = addDays(today, daysUntilSaturday);
  const sunday = addDays(saturday, 1);

  return [toIsoDate(saturday), toIsoDate(sunday)];
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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
          </div>

          <a-segmented v-model:value="activeSection" :options="sectionOptions" />
        </div>
      </section>

      <section class="catalog-layout">
        <div class="catalog-results">
          <a-card class="catalog-quick-toolbar" :body-style="{ padding: '12px' }">
            <div class="catalog-quick-toolbar__search-row">
              <a-input-search
                class="catalog-quick-toolbar__search"
                :value="filters.search"
                allow-clear
                aria-label="Поиск по объектам бронирования"
                placeholder="Поиск по названию"
                @input="(event) => updateFilter('search', event.target.value)"
                @change="(event) => updateFilter('search', event.target.value)"
                @search="(value) => updateFilter('search', value)"
              />

              <a-badge :dot="hasActiveFilters">
                <a-button
                  class="catalog-quick-toolbar__filter-button"
                  aria-label="Все фильтры"
                  @click="isFiltersOpen = true"
                >
                  <FilterFilled />
                </a-button>
              </a-badge>

              <a-button
                type="link"
                class="catalog-quick-toolbar__clear"
                :disabled="!hasActiveFilters"
                @click="resetFilters"
              >
                Очистить
              </a-button>
            </div>

            <div class="catalog-quick-toolbar__quick-row">
              <div class="catalog-quick-toolbar__group">
                <span class="catalog-quick-toolbar__label">Время:</span>
                <a-button
                  v-for="option in timePresetOptions"
                  :key="option.value"
                  size="small"
                  :type="timePreset === option.value ? 'primary' : 'text'"
                  @click="setTimePreset(option)"
                >
                  {{ option.label }}
                </a-button>

                <a-popover
                  v-model:open="isCustomTimeOpen"
                  trigger="click"
                  placement="bottom"
                  overlay-class-name="catalog-time-range-popover"
                >
                  <template #content>
                    <a-time-range-picker
                      :value="filters.timeRange"
                      value-format="HH:mm"
                      format="HH:mm"
                      :placeholder="['Время от', 'Время до']"
                      :minute-step="30"
                      @change="updateCustomTimeRange"
                    />
                  </template>

                  <a-button
                    size="small"
                    :type="timePreset === 'custom' ? 'primary' : 'text'"
                  >
                    {{ timePreset === 'custom' ? formatTimeRange(filters.timeRange) : 'Выбрать время' }}
                  </a-button>
                </a-popover>
              </div>

              <div class="catalog-quick-toolbar__group">
                <span class="catalog-quick-toolbar__label">Длительность:</span>
                <a-button
                  v-for="option in durationPresetOptions"
                  :key="option.value"
                  size="small"
                  :type="durationPreset === option.value ? 'primary' : 'text'"
                  @click="setDurationPreset(option)"
                >
                  {{ option.label }}
                </a-button>

                <a-popover
                  v-model:open="isCustomDurationOpen"
                  trigger="click"
                  placement="bottom"
                  overlay-class-name="catalog-duration-range-popover"
                >
                  <template #content>
                    <div class="catalog-duration-range-popover__content">
                      <a-select
                        :value="filters.durationRange?.[0]"
                        allow-clear
                        placeholder="От"
                        @change="(value) => updateCustomDurationRange(0, value)"
                      >
                        <a-select-option
                          v-for="option in durationOptions"
                          :key="`custom-from-${option.value}`"
                          :value="option.value"
                          :disabled="filters.durationRange?.[1] !== undefined && option.value > filters.durationRange[1]"
                        >
                          {{ option.label }}
                        </a-select-option>
                      </a-select>

                      <a-select
                        :value="filters.durationRange?.[1]"
                        allow-clear
                        placeholder="До"
                        @change="(value) => updateCustomDurationRange(1, value)"
                      >
                        <a-select-option
                          v-for="option in durationOptions"
                          :key="`custom-to-${option.value}`"
                          :value="option.value"
                          :disabled="filters.durationRange?.[0] !== undefined && option.value < filters.durationRange[0]"
                        >
                          {{ option.label }}
                        </a-select-option>
                      </a-select>
                    </div>
                  </template>

                  <a-button
                    size="small"
                    :type="durationPreset === 'custom' ? 'primary' : 'text'"
                  >
                    {{ durationPreset === 'custom' ? formatDurationRange(filters.durationRange) : 'Выбрать длительность' }}
                  </a-button>
                </a-popover>
              </div>

              <div class="catalog-quick-toolbar__group">
                <span class="catalog-quick-toolbar__label">Дата проведения:</span>
                <a-button
                  v-for="option in datePresetOptions"
                  :key="option.value"
                  size="small"
                  :type="datePreset === option.value ? 'primary' : 'text'"
                  @click="setDatePreset(option.value)"
                >
                  {{ option.label }}
                </a-button>

                <a-popover
                  v-model:open="isCustomDateOpen"
                  trigger="click"
                  placement="bottom"
                  overlay-class-name="catalog-date-range-popover"
                >
                  <template #content>
                    <a-range-picker
                      :value="filters.dateRange"
                      value-format="YYYY-MM-DD"
                      format="DD.MM.YYYY"
                      :placeholder="['Дата от', 'Дата до']"
                      @change="updateCustomDateRange"
                    />
                  </template>

                  <a-button
                    size="small"
                    :type="datePreset === 'custom' ? 'primary' : 'text'"
                  >
                    {{ datePreset === 'custom' ? formatDateRange(filters.dateRange) : 'Выбрать дату' }}
                  </a-button>
                </a-popover>
              </div>
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
            @open-documents="openDocuments"
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
      v-model:open="isDocumentsOpen"
      width="440"
      :title="`Документы: ${selectedDocumentsObject?.title ?? ''}`"
      placement="right"
      class="catalog-documents-drawer"
    >
      <template v-if="selectedDocumentsObject">
        <a-alert
          type="warning"
          show-icon
          message="Для бронирования необходимо изучить документы"
          :description="`Документов: ${selectedDrawerDocuments.length}`"
        />

        <a-list
          class="catalog-documents-drawer__list"
          bordered
          :data-source="selectedDrawerDocuments"
        >
          <template #renderItem="{ item, index }">
            <a-list-item>
              <a-list-item-meta
                :title="item"
                :description="`Документ ${index + 1}`"
              />
              <a-tag color="processing">К ознакомлению</a-tag>
            </a-list-item>
          </template>
        </a-list>
      </template>
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
            <a-list size="small" :data-source="selectedObject.matchingSlots">
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
