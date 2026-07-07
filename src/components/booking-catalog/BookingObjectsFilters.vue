<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  filterOptions: {
    type: Object,
    required: true,
  },
  resultCount: {
    type: Number,
    required: true,
  },
  groupLabel: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'reset']);

const filters = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const availabilityOptions = [
  { label: 'Доступно', value: 'available' },
  { label: 'Нужны документы', value: 'documents' },
  { label: 'На модерации', value: 'moderation' },
  { label: 'Нет слотов', value: 'noSlots' },
  { label: 'Недоступно', value: 'unavailable' },
];

function updateFilter(key, value) {
  filters.value = {
    ...filters.value,
    [key]: value,
  };
}
</script>

<template>
  <a-space direction="vertical" :size="18" class="catalog-filters">
    <div class="catalog-filters__header">
      <div>
        <a-typography-title :level="5">Фильтры каталога</a-typography-title>
        <a-typography-text type="secondary">
          {{ groupLabel || 'Выбранная группа' }} · найдено объектов: {{ resultCount }}
        </a-typography-text>
      </div>
      <a-button type="link" size="small" @click="emit('reset')">Сбросить фильтры</a-button>
    </div>

    <a-divider class="catalog-filters__divider" />

    <a-space direction="vertical" :size="12" class="catalog-filters__inner">
      <label class="catalog-filter-field">
        <span>Тип объекта</span>
        <a-select
          :value="filters.type"
          allow-clear
          aria-label="Фильтр по типу объекта"
          placeholder="Любой тип"
          @change="(value) => updateFilter('type', value)"
        >
          <a-select-option
            v-for="type in filterOptions.types"
            :key="type"
            :value="type"
          >
            {{ type }}
          </a-select-option>
        </a-select>
      </label>

      <label class="catalog-filter-field">
        <span>Лаборатория</span>
        <a-select
          :value="filters.laboratory"
          allow-clear
          show-search
          aria-label="Фильтр по лаборатории"
          placeholder="Любая лаборатория"
          @change="(value) => updateFilter('laboratory', value)"
        >
          <a-select-option
            v-for="laboratory in filterOptions.laboratories"
            :key="laboratory"
            :value="laboratory"
          >
            {{ laboratory }}
          </a-select-option>
        </a-select>
      </label>

      <label class="catalog-filter-field">
        <span>Доступность</span>
        <a-select
          :value="filters.availability"
          allow-clear
          aria-label="Фильтр по доступности"
          placeholder="Любой статус"
          @change="(value) => updateFilter('availability', value)"
        >
          <a-select-option
            v-for="status in availabilityOptions"
            :key="status.value"
            :value="status.value"
          >
            {{ status.label }}
          </a-select-option>
        </a-select>
      </label>
    </a-space>
  </a-space>
</template>
