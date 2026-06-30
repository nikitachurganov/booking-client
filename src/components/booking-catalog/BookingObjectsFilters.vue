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
});

const emit = defineEmits(['update:modelValue', 'reset']);

const filters = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const availabilityOptions = [
  { label: 'Доступно', value: 'available' },
  { label: 'Нет слотов', value: 'noSlots' },
  { label: 'Требуется подтверждение', value: 'moderation' },
  { label: 'Доступ ограничен', value: 'restricted' },
  { label: 'Нужны документы', value: 'documents' },
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
        <a-typography-title :level="5">Расширенные фильтры</a-typography-title>
        <a-typography-text type="secondary">Найдено объектов: {{ resultCount }}</a-typography-text>
      </div>
      <a-button type="link" size="small" @click="emit('reset')">Сбросить всё</a-button>
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
        <span>Услуга</span>
        <a-select
          :value="filters.service"
          allow-clear
          show-search
          aria-label="Фильтр по услуге"
          placeholder="Например, видеозапись"
          @change="(value) => updateFilter('service', value)"
        >
          <a-select-option
            v-for="service in filterOptions.services"
            :key="service"
            :value="service"
          >
            {{ service }}
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

    <a-divider class="catalog-filters__divider" />

    <a-space direction="vertical" :size="8" class="catalog-filters__inner">
      <a-checkbox
        :checked="filters.hasRequiredDocuments"
        @change="(event) => updateFilter('hasRequiredDocuments', event.target.checked)"
      >
        Есть обязательные документы
      </a-checkbox>

      <a-checkbox
        :checked="filters.requiresInstruction"
        @change="(event) => updateFilter('requiresInstruction', event.target.checked)"
      >
        Требуется ознакомление
      </a-checkbox>

      <a-checkbox
        :checked="filters.requiresModeration"
        @change="(event) => updateFilter('requiresModeration', event.target.checked)"
      >
        Требуется подтверждение
      </a-checkbox>

      <a-checkbox
        :checked="filters.requiresCheckIn"
        @change="(event) => updateFilter('requiresCheckIn', event.target.checked)"
      >
        Требуется check-in
      </a-checkbox>

      <a-checkbox
        :checked="filters.requiresCheckOut"
        @change="(event) => updateFilter('requiresCheckOut', event.target.checked)"
      >
        Требуется check-out
      </a-checkbox>

      <a-checkbox
        :checked="filters.collectiveBooking"
        @change="(event) => updateFilter('collectiveBooking', event.target.checked)"
      >
        Коллективное бронирование
      </a-checkbox>

      <a-checkbox
        :checked="filters.withSubAssets"
        @change="(event) => updateFilter('withSubAssets', event.target.checked)"
      >
        Есть подактивы или оборудование внутри
      </a-checkbox>
    </a-space>
  </a-space>
</template>
