<script setup>
defineProps({
  description: {
    type: String,
    default: 'Попробуйте изменить параметры поиска или сбросить фильтры.',
  },
  showReset: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['reset']);
</script>

<template>
  <a-card class="catalog-empty">
    <a-empty description="Объекты не найдены">
      <template #description>
        <a-space direction="vertical" :size="8">
          <strong>Объекты не найдены</strong>
          <a-typography-text type="secondary">
            {{ description }}
          </a-typography-text>
        </a-space>
      </template>
      <a-button v-if="showReset" type="primary" @click="emit('reset')">
        Сбросить фильтры
      </a-button>
    </a-empty>
  </a-card>
</template>
