<script setup>
import BookingObjectStatusTag from './BookingObjectStatusTag.vue';

defineProps({
  object: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['open', 'book']);

function handleBookClick(event, object) {
  event.stopPropagation();
  emit('book', object);
}

function getRequirementText(object) {
  if (object.requiresDocuments) {
    return 'Для бронирования необходимо ознакомиться с документами';
  }

  if (object.requiresInstruction) {
    return 'Перед бронированием нужно пройти инструктаж';
  }

  return '';
}
</script>

<template>
  <a-card
    class="booking-object-card"
    :body-style="{ padding: '14px' }"
    :tabindex="0"
    role="button"
    :aria-label="`Открыть объект ${object.title}`"
    @click="emit('open', object)"
    @keydown.enter.prevent="emit('open', object)"
    @keydown.space.prevent="emit('open', object)"
  >
    <div class="booking-object-card__image-wrap">
      <img class="booking-object-card__image" :src="object.imageUrl" :alt="object.title" />
      <a-tag class="booking-object-card__category" color="blue">{{ object.category }}</a-tag>
    </div>

    <div class="booking-object-card__body">
      <div class="booking-object-card__title-row">
        <a-typography-title :level="5" :ellipsis="{ rows: 2 }">
          {{ object.title }}
        </a-typography-title>
        <BookingObjectStatusTag :status="object.catalogStatus" />
      </div>

      <div class="booking-object-card__location">
        <span>{{ object.location }}</span>
        <span class="booking-object-card__dot" aria-hidden="true" />
        <span>{{ object.room }}</span>
      </div>

      <div class="booking-object-card__slot">
        <span>{{ object.slotCaption }}</span>
        <strong>{{ object.availabilityLabel }}</strong>
      </div>

      <div
        v-if="object.requiresDocuments || object.requiresInstruction"
        class="booking-object-card__requirement"
      >
        {{ getRequirementText(object) }}
      </div>

      <a-button
        class="booking-object-card__action"
        :type="object.canBook ? 'primary' : 'default'"
        block
        :aria-label="`${object.actionLabel}: ${object.title}`"
        @click="(event) => handleBookClick(event, object)"
      >
        {{ object.actionLabel }}
      </a-button>
    </div>
  </a-card>
</template>
