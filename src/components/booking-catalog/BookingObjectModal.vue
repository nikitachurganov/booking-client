<script setup>
import { computed, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import {
  CheckCircleOutlined,
  CloseOutlined,
  FileTextOutlined,
  RightOutlined,
  StopOutlined,
} from '@ant-design/icons-vue';

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

const emit = defineEmits(['update:open', 'document-viewed', 'request-created']);

const selectedSlotDate = ref(undefined);
const selectedSlotId = ref(undefined);
const selectedDocument = ref(null);
const isDocumentOpen = ref(false);
const hasScrolledDocument = ref(false);
const bookingForm = ref({
  serviceId: undefined,
  purpose: '',
});

const normalizedDocuments = computed(() => props.object?.documents ?? []);

const requiredDocumentsCount = computed(() => {
  const requiredDocuments = normalizedDocuments.value.filter((document) => document.required);

  return requiredDocuments.length || normalizedDocuments.value.length;
});

const viewedRequiredDocumentsCount = computed(() => {
  const requiredDocuments = normalizedDocuments.value.filter((document) => document.required);
  const documentsForProgress = requiredDocuments.length
    ? requiredDocuments
    : normalizedDocuments.value;

  return documentsForProgress.filter((document) => document.viewed).length;
});

const documentsProgress = computed(() => {
  if (!requiredDocumentsCount.value) {
    return 100;
  }

  return Math.round((viewedRequiredDocumentsCount.value / requiredDocumentsCount.value) * 100);
});

const requirementStates = computed(() => props.object?.requirementStates ?? []);

const incompleteRequirements = computed(() =>
  requirementStates.value.filter((requirement) => !requirement.complete),
);

const groupedSlots = computed(() => {
  const groups = new Map();

  for (const slot of props.object?.slots ?? []) {
    if (!groups.has(slot.date)) {
      groups.set(slot.date, []);
    }

    groups.get(slot.date).push(slot);
  }

  return [...groups.entries()]
    .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
    .map(([date, slots]) => ({
      date,
      label: formatDate(date),
      slots: [...slots].sort((left, right) => left.start.localeCompare(right.start)),
    }));
});

const slotDateOptions = computed(() =>
  groupedSlots.value.map((group) => ({
    label: group.label,
    value: group.date,
  })),
);

const selectedSlotGroup = computed(
  () => groupedSlots.value.find((group) => group.date === selectedSlotDate.value) ?? groupedSlots.value[0],
);

const visibleSlots = computed(() => selectedSlotGroup.value?.slots ?? []);

const availableSlots = computed(() =>
  (props.object?.slots ?? []).filter((slot) => getSlotStatus(slot) === 'available'),
);

const selectedSlot = computed(() =>
  availableSlots.value.find((slot) => getSlotId(slot) === selectedSlotId.value),
);

const selectedService = computed(() =>
  props.object?.services.find((service) => service.id === bookingForm.value.serviceId),
);

const nearestSlotLabel = computed(() =>
  props.object?.nextSlot ? formatSlot(props.object.nextSlot) : props.object?.availabilityLabel,
);

const bookingDisabledReason = computed(() => {
  if (incompleteRequirements.value.length) {
    return 'Сначала выполните требования чек-листа';
  }

  if (!selectedSlot.value) {
    return 'Выберите свободный слот';
  }

  if (!selectedService.value) {
    return 'Выберите тип услуги';
  }

  if (!bookingForm.value.purpose.trim()) {
    return 'Заполните описание цели работы';
  }

  return '';
});

const canSubmit = computed(() => !bookingDisabledReason.value);

watch(
  () => [props.open, props.object?.id],
  () => {
    selectedSlotId.value = undefined;
    selectedSlotDate.value = groupedSlots.value[0]?.date;
    selectedDocument.value = null;
    isDocumentOpen.value = false;
    hasScrolledDocument.value = false;
    bookingForm.value = {
      serviceId: props.object?.services[0]?.id,
      purpose: '',
    };
  },
  { immediate: true },
);

watch(
  () => slotDateOptions.value.map((option) => option.value).join('|'),
  () => {
    const hasSelectedDate = slotDateOptions.value.some(
      (option) => option.value === selectedSlotDate.value,
    );

    if (!hasSelectedDate) {
      selectedSlotDate.value = slotDateOptions.value[0]?.value;
      selectedSlotId.value = undefined;
    }
  },
);

function closeModal() {
  emit('update:open', false);
}

function openDocument(document) {
  selectedDocument.value = document;
  hasScrolledDocument.value = Boolean(document.viewed);
  isDocumentOpen.value = true;
}

function handleDocumentScroll(event) {
  const element = event.currentTarget;
  const scrollBottom = element.scrollTop + element.clientHeight;

  if (scrollBottom >= element.scrollHeight - 8) {
    hasScrolledDocument.value = true;
  }
}

function confirmDocumentViewed() {
  if (!props.object || !selectedDocument.value || !hasScrolledDocument.value) {
    return;
  }

  emit('document-viewed', {
    objectId: props.object.id,
    documentId: selectedDocument.value.id,
  });
  message.success('Ознакомление с документом зафиксировано');
  isDocumentOpen.value = false;
}

function updateSelectedSlotDate(value) {
  selectedSlotDate.value = value;
  selectedSlotId.value = undefined;
}

function chooseSlot(slot) {
  if (getSlotStatus(slot) !== 'available') {
    return;
  }

  selectedSlotId.value = getSlotId(slot);
}

function submitBooking() {
  if (!props.object || !canSubmit.value) {
    message.warning(bookingDisabledReason.value);
    return;
  }

  emit('request-created', {
    id: `request-${props.object.id}-${Date.now()}`,
    objectId: props.object.id,
    objectTitle: props.object.title,
    equipmentId: props.object.equipmentId,
    serviceTitle: selectedService.value.title,
    slotLabel: formatSlot(selectedSlot.value),
    purpose: bookingForm.value.purpose.trim(),
    status: 'moderation',
    createdAt: new Date().toISOString(),
  });
  message.success('Заявка отправлена на модерацию');
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
    available: { label: 'Свободен' },
    booked: { label: 'В брони' },
    requested: { label: 'С заявкой' },
    unavailable: { label: 'Недоступен' },
  };

  return configs[getSlotStatus(slot)] ?? configs.unavailable;
}

function formatSlot(slot) {
  return `${formatDate(slot.date)}, ${formatSlotRange(slot)}`;
}

function formatSlotRange(slot) {
  return `с ${slot.start} по ${slot.end}`;
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
    :closable="false"
    :destroy-on-close="false"
    @cancel="closeModal"
  >
    <a-spin :spinning="!object">
      <template v-if="object">
        <div class="booking-object-modal__body">
          <header class="booking-object-modal__header">
            <div>
              <a-typography-title :level="3" class="booking-object-modal__title">
                {{ object.title }}
              </a-typography-title>
              <a-typography-text type="secondary">
                {{ object.equipmentId }} · {{ object.laboratory }}
              </a-typography-text>
            </div>

            <button
              type="button"
              class="booking-object-modal__close"
              aria-label="Закрыть"
              @click="closeModal"
            >
              <CloseOutlined />
            </button>
          </header>

          <section class="booking-object-modal__section booking-object-modal__about-section">
            <a-typography-title :level="4" class="booking-object-modal__section-title">
              Об объекте
            </a-typography-title>

            <div class="booking-object-modal__about-grid">
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

              <div class="booking-object-modal__about-content">
                <a-typography-paragraph class="booking-object-modal__description">
                  {{ object.description }}
                </a-typography-paragraph>

                <div class="booking-object-modal__meta-grid">
                  <div class="booking-object-modal__meta-item">
                    <span>Ответственный</span>
                    <strong>{{ object.contactPerson }}</strong>
                  </div>
                  <div class="booking-object-modal__meta-item">
                    <span>Местоположение</span>
                    <strong>{{ object.location }}, {{ object.room }}</strong>
                  </div>
                  <div class="booking-object-modal__meta-item">
                    <span>Ближайший слот</span>
                    <strong>{{ nearestSlotLabel }}</strong>
                  </div>
                </div>

                <div class="booking-object-modal__characteristics">
                  <div
                    v-for="item in object.characteristics"
                    :key="item.label"
                    class="booking-object-modal__characteristic"
                  >
                    <span>{{ item.label }}</span>
                    <strong>{{ item.value }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div class="booking-object-modal__columns">
            <section class="booking-object-modal__section booking-object-modal__documents-section">
              <div class="booking-object-modal__section-head">
                <div>
                  <a-typography-title :level="4" class="booking-object-modal__section-title">
                    Документы и допуски
                  </a-typography-title>
                  <a-typography-text type="secondary">
                    Выполните требования перед бронированием
                  </a-typography-text>
                </div>
              </div>

              <div v-if="requirementStates.length" class="booking-object-modal__requirements">
                <div
                  v-for="requirement in requirementStates"
                  :key="requirement.id"
                  class="booking-object-modal__requirement"
                  :class="{ 'booking-object-modal__requirement--done': requirement.complete }"
                >
                  <CheckCircleOutlined v-if="requirement.complete" />
                  <StopOutlined v-else />
                  <span>
                    <strong>{{ requirement.title }}</strong>
                    <small>{{ requirement.description }}</small>
                  </span>
                </div>
              </div>

              <template v-if="normalizedDocuments.length">
                <div class="booking-object-modal__documents-progress-text">
                  <span>{{ viewedRequiredDocumentsCount }} из {{ requiredDocumentsCount }}</span>
                  обязательных документов изучено
                </div>

                <a-progress
                  :percent="documentsProgress"
                  :show-info="false"
                  :stroke-width="8"
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
                      <FileTextOutlined />
                      <span>
                        <span class="booking-object-modal__document-title">{{ item.title }}</span>
                        <span class="booking-object-modal__document-required">
                          {{ item.required ? 'Обязателен' : 'Необязателен' }}
                        </span>
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

            <section class="booking-object-modal__section booking-object-modal__slots-section">
              <div class="booking-object-modal__section-head">
                <div>
                  <a-typography-title :level="4" class="booking-object-modal__section-title">
                    Доступные слоты
                  </a-typography-title>
                  <a-typography-text type="secondary">
                    Выберите день и время
                  </a-typography-text>
                </div>

                <a-select
                  class="booking-object-modal__slot-day-select"
                  :value="selectedSlotDate"
                  :options="slotDateOptions"
                  placeholder="День"
                  @change="updateSelectedSlotDate"
                />
              </div>

              <template v-if="visibleSlots.length">
                <div class="booking-object-modal__slots">
                  <button
                    v-for="slot in visibleSlots"
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
                    <span class="booking-object-modal__slot-time">
                      {{ formatSlotRange(slot) }}
                    </span>
                    <span class="booking-object-modal__slot-status">
                      {{ getSlotStatusConfig(slot).label }}
                    </span>
                  </button>
                </div>
              </template>

              <a-empty
                v-else
                class="booking-object-modal__empty"
                description="Нет доступных слотов"
              />
            </section>
          </div>

          <section class="booking-object-modal__section booking-object-modal__request-section">
            <div class="booking-object-modal__section-head">
              <div>
                <a-typography-title :level="4" class="booking-object-modal__section-title">
                  Заявка на бронирование
                </a-typography-title>
                <a-typography-text type="secondary">
                  После отправки заявка перейдет в статус «На модерации»
                </a-typography-text>
              </div>
            </div>

            <a-form layout="vertical" class="booking-object-modal__request-form">
              <a-form-item label="Тип услуги" required>
                <a-select
                  v-model:value="bookingForm.serviceId"
                  placeholder="Выберите услугу"
                  :options="object.services.map((service) => ({ label: service.title, value: service.id }))"
                />
              </a-form-item>

              <a-form-item label="Выбранный слот" required>
                <a-input
                  :value="selectedSlot ? formatSlot(selectedSlot) : ''"
                  placeholder="Выберите слот справа"
                  readonly
                />
              </a-form-item>

              <a-form-item label="Описание цели работы" required>
                <a-textarea
                  v-model:value="bookingForm.purpose"
                  :rows="3"
                  placeholder="Например: спектральный анализ образцов для лабораторной работы"
                />
              </a-form-item>
            </a-form>
          </section>

          <div class="booking-object-modal__footer">
            <a-typography-text v-if="bookingDisabledReason" type="secondary">
              {{ bookingDisabledReason }}
            </a-typography-text>
            <a-typography-text v-else type="secondary">
              Все требования выполнены, заявка готова к отправке
            </a-typography-text>

            <a-tooltip :title="bookingDisabledReason">
              <a-button type="primary" :disabled="!canSubmit" @click="submitBooking">
                Отправить заявку
              </a-button>
            </a-tooltip>
          </div>
        </div>
      </template>
    </a-spin>
  </a-modal>

  <a-drawer
    v-model:open="isDocumentOpen"
    width="520"
    :title="selectedDocument?.title"
    placement="right"
    class="booking-document-drawer"
  >
    <template v-if="selectedDocument">
      <a-alert
        v-if="!selectedDocument.viewed"
        type="info"
        show-icon
        message="Прокрутите документ до конца"
        description="После просмотра станет доступна фиксация ознакомления."
      />

      <div class="booking-document-drawer__viewer" @scroll="handleDocumentScroll">
        <p v-for="index in 8" :key="index">
          {{ selectedDocument.content }}
        </p>
      </div>

    </template>

    <template #footer>
      <div v-if="selectedDocument" class="booking-document-drawer__footer">
        <a-typography-text v-if="selectedDocument.viewed" type="success">
          Документ уже изучен
        </a-typography-text>
        <a-typography-text v-else type="secondary">
          {{ hasScrolledDocument ? 'Можно подтвердить ознакомление' : 'Дочитайте документ до конца' }}
        </a-typography-text>

        <a-button
          type="primary"
          :disabled="selectedDocument.viewed || !hasScrolledDocument"
          @click="confirmDocumentViewed"
        >
          Ознакомился
        </a-button>
      </div>
    </template>
  </a-drawer>
</template>
