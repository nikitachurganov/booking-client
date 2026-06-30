<script setup>
import BookingCatalogEmptyState from './BookingCatalogEmptyState.vue';
import BookingObjectCard from './BookingObjectCard.vue';

defineProps({
  objects: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyDescription: {
    type: String,
    default: 'Нет объектов по выбранным условиям',
  },
  showReset: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['open', 'book', 'reset']);
</script>

<template>
  <div class="booking-objects-grid">
    <template v-if="loading">
      <a-card v-for="index in 6" :key="index" class="booking-object-card">
        <a-skeleton-image active class="booking-objects-grid__skeleton-image" />
        <a-skeleton active :paragraph="{ rows: 4 }" />
      </a-card>
    </template>

    <BookingCatalogEmptyState
      v-else-if="objects.length === 0"
      class="booking-objects-grid__empty"
      :description="emptyDescription"
      :show-reset="showReset"
      @reset="emit('reset')"
    />

    <BookingObjectCard
      v-for="object in objects"
      v-else
      :key="object.id"
      :object="object"
      @open="emit('open', object)"
      @book="emit('book', object)"
    />
  </div>
</template>
