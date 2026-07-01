<script setup>
import { CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons-vue';

defineProps({
  object: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['open']);

function getSlotText(object) {
  return object.visibleSlot ? object.availabilityLabel : 'Нет доступных слотов';
}

function getAdditionalSlotsText(object) {
  if (!object.additionalSlotsCount) {
    return '';
  }

  return `ещё ${object.additionalSlotsCount} ${getSlotWord(object.additionalSlotsCount)}`;
}

function getSlotWord(count) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'слотов';
  }

  if (lastDigit === 1) {
    return 'слот';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'слота';
  }

  return 'слотов';
}

</script>

<template>
  <a-card
    class="booking-object-card"
    :body-style="{ padding: 0 }"
    :tabindex="0"
    role="button"
    :aria-label="`Открыть объект ${object.title}`"
    @click="emit('open', object)"
    @keydown.enter.prevent="emit('open', object)"
    @keydown.space.prevent="emit('open', object)"
  >
    <div class="booking-object-card__image-wrap">
      <img class="booking-object-card__image" :src="object.imageUrl" :alt="object.title" />
      <a-tag
        v-if="object.requiresDocuments"
        color="warning"
        class="booking-object-card__requirement-tag"
      >
        Требуется ознакомление
      </a-tag>
    </div>

    <div class="booking-object-card__body">
      <a-typography-title :level="5" :ellipsis="{ rows: 1 }" class="booking-object-card__title">
        {{ object.title }}
      </a-typography-title>

      <div class="booking-object-card__info-list">
        <div class="booking-object-card__info-row">
          <CalendarOutlined class="booking-object-card__info-icon" />
          <span class="booking-object-card__info-main">{{ getSlotText(object) }}</span>
          <span
            v-if="getAdditionalSlotsText(object)"
            class="booking-object-card__dot"
            aria-hidden="true"
          />
          <span v-if="getAdditionalSlotsText(object)" class="booking-object-card__info-extra">
            {{ getAdditionalSlotsText(object) }}
          </span>
        </div>

        <div class="booking-object-card__info-row">
          <EnvironmentOutlined class="booking-object-card__info-icon" />
          <span class="booking-object-card__info-main">
            {{ object.location }}, {{ object.room }}
          </span>
        </div>
      </div>
    </div>
  </a-card>
</template>
