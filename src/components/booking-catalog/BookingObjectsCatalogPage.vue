<script setup>
import { computed, onMounted, ref } from 'vue';
import { FilterFilled } from '@ant-design/icons-vue';
import {
  fetchBookingObjects,
  getBookingObjectsFilterOptions,
  getBookingShowcaseGroups,
} from '../../services/bookingObjectsService';
import BookingObjectsFilters from './BookingObjectsFilters.vue';
import BookingObjectsGrid from './BookingObjectsGrid.vue';
import BookingObjectModal from './BookingObjectModal.vue';

const defaultFilters = {
  search: '',
  type: undefined,
  laboratory: undefined,
  availability: undefined,
};

const objects = ref([]);
const bookingRequests = ref([]);
const isLoading = ref(true);
const loadError = ref('');
const selectedObjectId = ref(undefined);
const isDetailsOpen = ref(false);
const isFiltersOpen = ref(false);
const filters = ref({ ...defaultFilters });
const activeSection = ref('catalog');
const selectedGroup = ref(undefined);

const sectionOptions = [
  { label: 'Каталог', value: 'catalog' },
  { label: 'Мои заявки', value: 'requests' },
  { label: 'Мои бронирования', value: 'bookings' },
];

const showcaseGroups = getBookingShowcaseGroups();

const enrichedObjects = computed(() => objects.value.map((object) => enrichObject(object)));

const selectedGroupConfig = computed(
  () => showcaseGroups.find((group) => group.value === selectedGroup.value) ?? null,
);

const groupCards = computed(() =>
  showcaseGroups.map((group) => {
    const groupObjects = enrichedObjects.value.filter((object) => object.showcaseGroup === group.value);

    return {
      ...group,
      count: groupObjects.length,
      examples: groupObjects.slice(0, 2).map((object) => object.title),
      nextSlot: groupObjects
        .filter((object) => object.nextSlot)
        .sort((left, right) => getSlotScore(left.nextSlot) - getSlotScore(right.nextSlot))[0]?.availabilityLabel,
    };
  }),
);

const groupObjects = computed(() =>
  selectedGroup.value
    ? enrichedObjects.value.filter((object) => object.showcaseGroup === selectedGroup.value)
    : enrichedObjects.value,
);

const filterOptions = computed(() => getBookingObjectsFilterOptions(groupObjects.value));

const selectedObject = computed(() =>
  enrichedObjects.value.find((object) => object.id === selectedObjectId.value) ?? null,
);

const searchQuery = computed(() => filters.value.search.trim().toLowerCase());

const hasSearchQuery = computed(() => Boolean(searchQuery.value));

const filteredObjects = computed(() => {
  const filtered = groupObjects.value.filter((object) => {
    const matchesSearch = !searchQuery.value || getObjectSearchText(object).includes(searchQuery.value);
    const matchesType = !filters.value.type || object.type === filters.value.type;
    const matchesLaboratory =
      !filters.value.laboratory || object.laboratory === filters.value.laboratory;
    const matchesAvailability =
      !filters.value.availability || object.catalogStatus === filters.value.availability;

    return matchesSearch && matchesType && matchesLaboratory && matchesAvailability;
  });

  return sortObjects(filtered);
});

const globalSearchResults = computed(() => {
  if (!hasSearchQuery.value) {
    return [];
  }

  return sortObjects(
    enrichedObjects.value.filter((object) => getObjectSearchText(object).includes(searchQuery.value)),
  );
});

const visibleCatalogObjects = computed(() =>
  selectedGroup.value ? filteredObjects.value : globalSearchResults.value,
);

const isShowcaseHome = computed(() =>
  activeSection.value === 'catalog' && !selectedGroup.value && !hasSearchQuery.value,
);

const hasActiveCatalogFilters = computed(() =>
  Boolean(
    filters.value.type ||
      filters.value.laboratory ||
      filters.value.availability,
  ),
);

const hasActiveFilters = computed(() => Boolean(hasSearchQuery.value || hasActiveCatalogFilters.value));

const emptyDescription = computed(() =>
  activeSection.value === 'catalog'
    ? selectedGroup.value
      ? 'В этой группе нет объектов по выбранным условиям. Измените поиск или фильтры.'
      : 'По такому запросу ничего не найдено. Проверьте название, ID, аудиторию или услугу.'
    : 'Здесь появятся ваши заявки и бронирования.',
);

const catalogTitle = computed(() =>
  selectedGroupConfig.value ? selectedGroupConfig.value.label : 'Бронирование',
);

const catalogSubtitle = computed(() =>
  selectedGroupConfig.value
    ? 'Реестр объектов выбранной группы: поиск, фильтры и бронирование'
    : 'Найдите объект по названию или выберите группу бронирования',
);

const catalogResultLabel = computed(() =>
  selectedGroup.value
    ? `Найдено в группе: ${filteredObjects.value.length}`
    : `Найдено по всем группам: ${globalSearchResults.value.length}`,
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

function resetCatalogView() {
  selectedGroup.value = undefined;
  filters.value = { ...defaultFilters };
}

function clearCatalogFilters() {
  filters.value = {
    ...filters.value,
    type: undefined,
    laboratory: undefined,
    availability: undefined,
  };
}

function updateFilter(key, value) {
  filters.value = {
    ...filters.value,
    [key]: value,
  };
}

function openDetails(object) {
  selectedObjectId.value = object.id;
  isDetailsOpen.value = true;
}

function selectGroup(groupValue) {
  selectedGroup.value = groupValue;
  filters.value = { ...defaultFilters };
}

function getGroupLabel(groupValue) {
  return showcaseGroups.find((group) => group.value === groupValue)?.label ?? 'Группа';
}

function handleDocumentViewed({ objectId, documentId }) {
  objects.value = objects.value.map((object) => {
    if (object.id !== objectId) {
      return object;
    }

    return {
      ...object,
      documents: object.documents.map((document) =>
        document.id === documentId ? { ...document, viewed: true } : document,
      ),
    };
  });
}

function handleRequestCreated(request) {
  bookingRequests.value = [request, ...bookingRequests.value];
  isDetailsOpen.value = false;
  activeSection.value = 'requests';
}

function enrichObject(object) {
  const requirementStates = object.requirements.map((requirement) => {
    if (requirement.kind === 'document') {
      const document = object.documents.find((item) => item.id === requirement.documentId);

      return {
        ...requirement,
        complete: Boolean(document?.viewed),
      };
    }

    return {
      ...requirement,
      complete: Boolean(requirement.complete),
    };
  });

  const availableSlots = object.slots
    .filter((slot) => getSlotStatus(slot) === 'available')
    .sort((left, right) => getSlotScore(left) - getSlotScore(right));
  const nextSlot = availableSlots[0];
  const incompleteRequirements = requirementStates.filter((requirement) => !requirement.complete);

  let catalogStatus = 'available';
  let availabilityLabel = nextSlot ? formatSlot(nextSlot) : 'Нет доступных слотов';

  if (!object.slots.length) {
    catalogStatus = 'unavailable';
    availabilityLabel = 'Временно недоступно';
  } else if (!nextSlot) {
    catalogStatus = 'noSlots';
  } else if (incompleteRequirements.length) {
    catalogStatus = 'documents';
  } else if (object.moderationRequired) {
    catalogStatus = 'moderation';
  }

  return {
    ...object,
    showcaseGroupLabel: getGroupLabel(object.showcaseGroup),
    requirementStates,
    requirementsCount: requirementStates.length,
    completedRequirementsCount: requirementStates.length - incompleteRequirements.length,
    incompleteRequirements,
    availableSlots,
    nextSlot,
    catalogStatus,
    availabilityLabel,
  };
}

function sortObjects(items) {
  return [...items].sort((left, right) => {
    const slotDiff = getSlotScore(left.nextSlot) - getSlotScore(right.nextSlot);

    if (slotDiff !== 0) {
      return slotDiff;
    }

    return left.title.localeCompare(right.title, 'ru');
  });
}

function getObjectSearchText(object) {
  return [
    object.title,
    object.equipmentId,
    object.description,
    object.type,
    object.category,
    object.laboratory,
    object.location,
    object.room,
    object.department,
    getGroupLabel(object.showcaseGroup),
    ...object.services.map((service) => service.title),
    ...object.characteristics.flatMap((item) => [item.label, item.value]),
    ...object.assets,
  ]
    .join(' ')
    .toLowerCase();
}

function getSlotStatus(slot) {
  if (slot.status) {
    return slot.status;
  }

  return slot.available ? 'available' : 'booked';
}

function getSlotScore(slot) {
  if (!slot) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Number(`${slot.date.replaceAll('-', '')}${slot.start.replace(':', '')}`);
}

function formatSlot(slot) {
  return `${formatDate(slot.date)}, ${slot.start}-${slot.end}`;
}

function formatDate(date) {
  const [, month, day] = date.split('-');
  return `${day}.${month}`;
}

function formatRequestDate(value) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
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

      <div class="catalog-header__divider" aria-hidden="true"></div>
      <div class="catalog-header__profile" aria-label="Профиль пользователя">
        <a-avatar class="catalog-header__avatar" :size="36">АК</a-avatar>
        <div class="catalog-header__profile-info">
          <span class="catalog-header__profile-name">Александр Ким</span>
          <span class="catalog-header__profile-email">a.kim@dvfu.ru</span>
        </div>
      </div>
    </header>

    <main class="catalog-main">
      <section class="catalog-content-header" aria-labelledby="catalog-title">
        <div class="catalog-title-block">
          <div>
            <a-typography-title id="catalog-title" :level="4">
              {{ catalogTitle }}
            </a-typography-title>
            <a-typography-text type="secondary">
              {{ catalogSubtitle }}
            </a-typography-text>
          </div>

          <a-segmented v-model:value="activeSection" :options="sectionOptions" />
        </div>
      </section>

      <section class="catalog-layout">
        <div class="catalog-results">
          <div v-if="activeSection === 'catalog'" class="catalog-quick-toolbar">
            <div class="catalog-quick-toolbar__search-row">
              <div class="catalog-quick-toolbar__search-group">
                <a-input
                  class="catalog-quick-toolbar__search"
                  :value="filters.search"
                  allow-clear
                  aria-label="Поиск по объектам бронирования"
                  placeholder="Поиск по названию, ID, аудитории или услуге"
                  @input="(event) => updateFilter('search', event.target.value)"
                  @change="(event) => updateFilter('search', event.target.value)"
                />

                <a-badge v-if="selectedGroup" :dot="hasActiveCatalogFilters">
                  <a-button
                    class="catalog-quick-toolbar__filter-button"
                    aria-label="Все фильтры"
                    @click="isFiltersOpen = true"
                  >
                    <FilterFilled />
                  </a-button>
                </a-badge>

                <a-button
                  v-if="hasActiveFilters"
                  type="link"
                  class="catalog-quick-toolbar__clear"
                  @click="resetFilters"
                >
                  Очистить
                </a-button>

                <a-button
                  v-if="selectedGroup"
                  type="link"
                  class="catalog-quick-toolbar__clear"
                  @click="resetCatalogView"
                >
                  Все группы
                </a-button>
              </div>

              <a-typography-text type="secondary">
                {{ catalogResultLabel }}
              </a-typography-text>
            </div>
          </div>

          <a-alert
            v-if="loadError"
            class="catalog-alert"
            type="error"
            show-icon
            :message="loadError"
            description="Обновите страницу или повторите запрос позже."
          />

          <template v-else-if="activeSection === 'catalog'">
            <div v-if="isShowcaseHome" class="booking-showcase">
              <button
                v-for="group in groupCards"
                :key="group.value"
                type="button"
                class="booking-showcase-card"
                @click="selectGroup(group.value)"
              >
                <span class="booking-showcase-card__head">
                  <span class="booking-showcase-card__title">{{ group.label }}</span>
                  <a-tag>{{ group.count }}</a-tag>
                </span>
                <span class="booking-showcase-card__description">{{ group.description }}</span>
                <span v-if="group.examples.length" class="booking-showcase-card__examples">
                  {{ group.examples.join(' · ') }}
                </span>
                <span v-else class="booking-showcase-card__examples">
                  Объекты появятся после настройки реестра
                </span>
                <span v-if="group.nextSlot" class="booking-showcase-card__meta">
                  Ближайший слот: {{ group.nextSlot }}
                </span>
              </button>
            </div>

            <div v-else-if="selectedGroup" class="catalog-group-context">
              <a-button type="link" class="catalog-group-context__back" @click="resetCatalogView">
                Все группы
              </a-button>
              <a-typography-text type="secondary">
                {{ selectedGroupConfig?.description }}
              </a-typography-text>
            </div>

            <BookingObjectsGrid
              v-if="!isShowcaseHome"
              :objects="visibleCatalogObjects"
              :loading="isLoading"
              :empty-description="emptyDescription"
              :show-reset="hasActiveFilters"
              @open="openDetails"
              @reset="resetFilters"
            />
          </template>

          <a-card v-else-if="activeSection === 'requests'" class="catalog-requests-card">
            <template #title>Мои заявки</template>
            <a-list
              v-if="bookingRequests.length"
              :data-source="bookingRequests"
              item-layout="vertical"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta
                    :title="`${item.objectTitle} · ${item.serviceTitle}`"
                    :description="`${item.equipmentId} · ${item.slotLabel}`"
                  />
                  <p class="catalog-request-purpose">{{ item.purpose }}</p>
                  <template #extra>
                    <a-space direction="vertical" align="end" :size="4">
                      <a-tag color="processing">На модерации</a-tag>
                      <a-typography-text type="secondary">
                        {{ formatRequestDate(item.createdAt) }}
                      </a-typography-text>
                    </a-space>
                  </template>
                </a-list-item>
              </template>
            </a-list>
            <a-empty v-else description="Заявок пока нет. Выберите объект в каталоге и отправьте заявку." />
          </a-card>

          <a-card v-else class="catalog-requests-card">
            <template #title>Мои бронирования</template>
            <a-empty description="Подтвержденные бронирования появятся после модерации." />
          </a-card>
        </div>
      </section>
    </main>

    <a-drawer
      v-model:open="isFiltersOpen"
      width="360"
      title="Фильтры каталога"
      placement="right"
    >
      <BookingObjectsFilters
        v-model="filters"
        :filter-options="filterOptions"
        :result-count="filteredObjects.length"
        :group-label="selectedGroupConfig?.label"
        @reset="clearCatalogFilters"
      />
    </a-drawer>

    <BookingObjectModal
      v-model:open="isDetailsOpen"
      :object="selectedObject"
      @document-viewed="handleDocumentViewed"
      @request-created="handleRequestCreated"
    />
  </div>
</template>
