<script setup>
import { CalendarOutlined, EnvironmentOutlined, SafetyCertificateOutlined } from '@ant-design/icons-vue';

defineProps({
  object: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['open']);

const statusConfig = {
  available: { color: 'success', label: 'Доступно' },
  documents: { color: 'warning', label: 'Нужны документы' },
  moderation: { color: 'processing', label: 'На модерации' },
  noSlots: { color: 'default', label: 'Нет слотов' },
  unavailable: { color: 'error', label: 'Недоступно' },
};

function getStatus(object) {
  return statusConfig[object.catalogStatus] ?? statusConfig.unavailable;
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
      <a-tag :color="getStatus(object).color" class="booking-object-card__requirement-tag">
        {{ getStatus(object).label }}
      </a-tag>
    </div>

    <div class="booking-object-card__body">
      <div class="booking-object-card__eyebrow">
        <span>{{ object.equipmentId }}</span>
        <span>{{ object.showcaseGroupLabel || object.type }}</span>
      </div>

      <a-typography-title :level="5" :ellipsis="{ rows: 1 }" class="booking-object-card__title">
        {{ object.title }}
      </a-typography-title>

      <div class="booking-object-card__info-list">
        <div class="booking-object-card__info-row">
          <CalendarOutlined class="booking-object-card__info-icon" />
          <span class="booking-object-card__info-main">{{ object.availabilityLabel }}</span>
        </div>

        <div class="booking-object-card__info-row">
          <EnvironmentOutlined class="booking-object-card__info-icon" />
          <span class="booking-object-card__info-main">
            {{ object.laboratory }} · {{ object.location }}, {{ object.room }}
          </span>
        </div>

        <div class="booking-object-card__info-row">
          <SafetyCertificateOutlined class="booking-object-card__info-icon" />
          <span class="booking-object-card__info-main">
            Допуски: {{ object.completedRequirementsCount }} из {{ object.requirementsCount }}
          </span>
        </div>
      </div>
    </div>
  </a-card>
</template>
