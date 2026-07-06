<script setup>
import { computed, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  RightOutlined,
} from '@ant-design/icons-vue';
import BookingObjectStatusTag from './BookingObjectStatusTag.vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  object: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:open']);

const selectedSlotId = ref(undefined);

const normalizedDocuments = computed(() => {
  const documents = props.object?.documents ?? [];

  return documents.map((document, index) =>
    typeof document === 'string'
      ? {
          id: `${props.object?.id ?? 'object'}-document-${index}`,
          title: document,
          url: '#',
          required: Boolean(props.object?.requiresDocuments),
          viewed: !props.object?.requiresDocuments || index % 2 === 0,
        }
      : {
          url: '#',
          required: false,
          viewed: false,
          ...document,
        },
  );
});

const requiredDocumentsCount = computed(() => {
  const requiredDocuments = normalizedDocuments.value.filter((document) => document.required);

  return requiredDocuments.length || normalizedDocuments.value.length;
});

const viewedRequiredDocumentsCount = computed(() => {
  const requiredDocuments = normalizedDocuments.value.filter((document) => document.required);
  const documentsForProgress = requiredDocuments.length ? requiredDocuments : normalizedDocuments.value;

  return documentsForProgress.filter((document) => document.viewed).length;
});

const documentsProgress = computed(() => {
  if (!requiredDocumentsCount.value) {
    return 100;
  }

  return Math.round((viewedRequiredDocumentsCount.value / requiredDocumentsCount.value) * 100);
});

const unreadRequiredDocuments = computed(() =>
  normalizedDocuments.value.filter((document) => document.required && !document.viewed),
);

const groupedSlots = computed(() => {
  const groups = new Map();

  for (const slot of props.object?.slots ?? []) {
    if (!groups.has(slot.date)) {
      groups.set(slot.date, []);
    }

    groups.get(slot.date).push(slot);
  }

  return [...groups.entries()].map(([date, slots]) => ({
    date,
    label: formatDate(date),
    slots: [...slots].sort((left, right) => left.start.localeCompare(right.start)),
  }));
});

const availableSlots = computed(() =>
  (props.object?.slots ?? []).filter((slot) => getSlotStatus(slot) === 'available'),
);

const selectedSlot = computed(() =>
  availableSlots.value.find((slot) => getSlotId(slot) === selectedSlotId.value),
);

const primaryDisabledReason = computed(() => {
  if (unreadRequiredDocuments.value.length) {
    return 'Сначала ознакомьтесь с обязательными документами';
  }

  if (!selectedSlot.value) {
    return 'Выберите свободный слот';
  }

  return '';
});

const canSubmit = computed(() => !primaryDisabledReason.value);

watch(
  () => props.open,
  (open) => {
    if (!open) {
      selectedSlotId.value = undefined;
    }
  },
);

watch(
  () => props.object?.id,
  () => {
    selectedSlotId.value = undefined;
  },
);

function closeModal() {
  emit('update:open', false);
}

function openDocument(document) {
  message.info(`Открытие документа: ${document.title}`);
}

function chooseSlot(slot) {
  if (getSlotStatus(slot) !== 'available') {
    return;
  }

  selectedSlotId.value = getSlotId(slot);
}

function submitBooking() {
  if (!props.object || !selectedSlot.value) {
    return;
  }

  message.success(
    `Слот выбран: ${props.object.title}, ${formatSlot(selectedSlot.value)}. Далее пользователь перейдет к созданию заявки.`,
  );
  closeModal();
}

function getSlotId(slot) {
  return slot.id ?? `${slot.date}-${slot.start}-${slot.end}`;
}

function getSlotStatus(slot) {
  if (slot.status) {
    return slot.status;
  }

  return slot.available ? 'available' : 'booked';
}

function getSlotStatusConfig(slot) {
  const configs = {
    available: { color: 'success', label: 'Свободен' },
    booked: { color: 'default', label: 'В брони' },
    requested: { color: 'processing', label: 'С заявкой' },
    unavailable: { color: 'error', label: 'Недоступен' },
  };

  return configs[getSlotStatus(slot)] ?? configs.unavailable;
}

function formatSlot(slot) {
  return `${formatDate(slot.date)}, ${slot.start}-${slot.end}`;
}

function formatDate(date) {
  const today = toIsoDate(new Date());
  const tomorrow = toIsoDate(addDays(new Date(), 1));

  if (date === today) {
    return `Сегодня, ${formatShortDate(date)}`;
  }

  if (date === tomorrow) {
    return `Завтра, ${formatShortDate(date)}`;
  }

  return formatShortDate(date);
}

function formatShortDate(date) {
  const [, month, day] = date.split('-');
  return `${day}.${month}`;
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
</script>

<template>
  <a-modal
    :open="open"
    width="1040px"
    class="booking-object-modal"
    :footer="null"
    :destroy-on-close="false"
    @cancel="closeModal"
  >
    <template v-if="object" #title>
      <div class="booking-object-modal__header">
        <div class="booking-object-modal__title-block">
          <a-typography-title :level="4" class="booking-object-modal__title">
            {{ object.title }}
          </a-typography-title>
          <div class="booking-object-modal__subtitle">
            {{ object.type }} · {{ object.location }}, {{ object.room }}
          </div>
        </div>

        <BookingObjectStatusTag :status="object.catalogStatus" />
      </div>
    </template>

    <a-spin :spinning="!object">
      <template v-if="object">
        <div class="booking-object-modal__body">
          <section class="booking-object-modal__section booking-object-modal__summary">
            <div class="booking-object-modal__image-wrap">
              <img
                v-if="object.imageUrl"
                class="booking-object-modal__image"
                :src="object.imageUrl"
                :alt="object.title"
              />
              <a-empty
                v-else
                class="booking-object-modal__image-empty"
                description="Нет изображения"
              />
            </div>

            <div class="booking-object-modal__summary-content">
              <a-space wrap :size="[6, 6]">
                <a-tag color="blue">{{ object.category }}</a-tag>
                <a-tag>{{ object.department }}</a-tag>
              </a-space>

              <a-typography-paragraph class="booking-object-modal__description">
                {{ object.description }}
              </a-typography-paragraph>

              <a-descriptions :column="1" size="small" bordered>
                <a-descriptions-item label="Местоположение">
                  <EnvironmentOutlined /> {{ object.location }}, {{ object.room }}
                </a-descriptions-item>
                <a-descriptions-item label="Ближайший слот">
                  <CalendarOutlined /> {{ object.availabilityLabel }}
                </a-descriptions-item>
                <a-descriptions-item label="Ответственный">
                  {{ object.contactPerson }}
                </a-descriptions-item>
              </a-descriptions>
            </div>
          </section>

          <section class="booking-object-modal__section booking-object-modal__documents-section">
            <div class="booking-object-modal__documents-head">
              <a-typography-title :level="4">Документы</a-typography-title>
              <a-typography-text>
                Перед бронированием ознакомьтесь с документами
              </a-typography-text>
            </div>

            <template v-if="normalizedDocuments.length">
              <div class="booking-object-modal__documents-progress-text">
                <span>{{ viewedRequiredDocumentsCount }} из {{ requiredDocumentsCount }}</span>
                обязательных документов изучено
              </div>

              <a-progress
                :percent="documentsProgress"
                :show-info="false"
                :stroke-width="6"
                class="booking-object-modal__documents-progress"
              />

              <div class="booking-object-modal__documents-list">
                <button
                  v-for="item in normalizedDocuments"
                  :key="item.id"
                  type="button"
                  class="booking-object-modal__document-row"
                  @click="openDocument(item)"
                >
                  <span class="booking-object-modal__document-copy">
                    <span class="booking-object-modal__document-title">{{ item.title }}</span>
                    <span class="booking-object-modal__document-required">
                      {{ item.required ? 'Обязателен' : 'Необязателен' }}
                    </span>
                  </span>

                  <span class="booking-object-modal__document-action">
                    <span
                      class="booking-object-modal__document-status"
                      :class="{ 'booking-object-modal__document-status--pending': !item.viewed }"
                    >
                      {{ item.viewed ? 'Изучен' : 'Изучить' }}
                    </span>
                    <RightOutlined />
                  </span>
                </button>
              </div>
            </template>

            <a-empty
              v-else
              class="booking-object-modal__empty"
              description="Документы не требуются"
            />
          </section>
          <section class="booking-object-modal__section">
            <div class="booking-object-modal__section-head">
              <div>
                <a-typography-title :level="5">Доступные слоты</a-typography-title>
                <a-typography-text type="secondary">
                  Выберите один свободный слот для бронирования
                </a-typography-text>
              </div>
            </div>

            <template v-if="groupedSlots.length && availableSlots.length">
              <div class="booking-object-modal__slot-groups">
                <div
                  v-for="group in groupedSlots"
                  :key="group.date"
                  class="booking-object-modal__slot-group"
                >
                  <div class="booking-object-modal__slot-date">{{ group.label }}</div>

                  <div class="booking-object-modal__slots">
                    <button
                      v-for="slot in group.slots"
                      :key="getSlotId(slot)"
                      type="button"
                      class="booking-object-modal__slot"
                      :class="{
                        'booking-object-modal__slot--selected': selectedSlotId === getSlotId(slot),
                        'booking-object-modal__slot--disabled': getSlotStatus(slot) !== 'available',
                      }"
                      :disabled="getSlotStatus(slot) !== 'available'"
                      @click="chooseSlot(slot)"
                    >
                      <span>{{ slot.start }}-{{ slot.end }}</span>
                      <a-tag :color="getSlotStatusConfig(slot).color">
                        {{ getSlotStatusConfig(slot).label }}
                      </a-tag>
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <a-empty
              v-else
              class="booking-object-modal__empty"
              description="Нет доступных слотов"
            >
              <template #description>
                <span>Попробуйте выбрать другой объект или изменить параметры поиска.</span>
              </template>
            </a-empty>
          </section>
        </div>

        <div class="booking-object-modal__footer">
          <a-typography-text v-if="primaryDisabledReason" type="secondary">
            {{ primaryDisabledReason }}
          </a-typography-text>
          <a-typography-text v-else type="secondary">
            Выбран слот: {{ formatSlot(selectedSlot) }}
          </a-typography-text>

          <a-space>
            <a-button @click="closeModal">Отмена</a-button>
            <a-tooltip :title="primaryDisabledReason">
              <a-button type="primary" :disabled="!canSubmit" @click="submitBooking">
                Забронировать
              </a-button>
            </a-tooltip>
          </a-space>
        </div>
      </template>
    </a-spin>
  </a-modal>
</template>
