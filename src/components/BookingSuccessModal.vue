<script setup lang="ts">
import {
  AppstoreOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  ToolOutlined,
} from '@ant-design/icons-vue'
import type { BookingSummary } from '@/api/objects'

defineProps<{ booking: BookingSummary | null }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ goToBookings: [] }>()

const goToBookings = () => {
  open.value = false
  emit('goToBookings')
}
</script>

<template>
  <a-modal v-model:open="open" :width="640" centered :footer="null" wrap-class-name="success-modal">
    <div v-if="booking" class="success">
      <CheckCircleFilled class="success-icon" />
      <h2 class="success-title">Заявка отправлена</h2>
      <p class="success-text">
        Мы передали заявку на обработку. Когда она будет рассмотрена, вы получите уведомление по электронной почте
        или push-уведомление.
      </p>
      <p class="success-number">Заявка № {{ booking.number }}</p>

      <dl class="details">
        <div class="row">
          <ToolOutlined class="row-icon" />
          <dt>Объект</dt>
          <dd>{{ booking.title }}</dd>
        </div>
        <div class="row">
          <EnvironmentOutlined class="row-icon" />
          <dt>Место</dt>
          <dd>{{ booking.place }}</dd>
        </div>
        <div class="row">
          <CalendarOutlined class="row-icon" />
          <dt>Дата</dt>
          <dd>{{ booking.date }}</dd>
        </div>
        <div class="row">
          <ClockCircleOutlined class="row-icon" />
          <dt>Время</dt>
          <dd>{{ booking.time }}</dd>
        </div>
        <div v-if="booking.service" class="row">
          <AppstoreOutlined class="row-icon" />
          <dt>Услуга</dt>
          <dd>{{ booking.service }}</dd>
        </div>
        <div class="row">
          <FileTextOutlined class="row-icon" />
          <dt>Статус</dt>
          <dd><a-tag color="warning">На рассмотрении</a-tag></dd>
        </div>
      </dl>

      <a-alert type="info" show-icon message="Следить за статусом можно в разделе «Мои бронирования»." />

      <div class="actions">
        <a-button size="large" @click="open = false">Вернуться в каталог</a-button>
        <a-button size="large" type="primary" @click="goToBookings">Перейти в мои бронирования</a-button>
      </div>
    </div>
  </a-modal>
</template>

<style scoped>
.success {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px;
}
.success-icon {
  align-self: center;
  font-size: 72px;
  color: #52c41a;
}
.success-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  text-align: center;
  color: rgba(0, 0, 0, 0.88);
}
.success-text {
  margin: -8px 0 0;
  font-size: 14px;
  line-height: 22px;
  text-align: center;
  color: rgba(0, 0, 0, 0.65);
}
.success-number {
  margin: -8px 0 0;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
  color: rgba(0, 0, 0, 0.45);
}
.details {
  margin: 0;
  padding: 4px 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}
.row {
  display: grid;
  grid-template-columns: 24px minmax(80px, 160px) minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  min-height: 48px;
}
.row + .row {
  border-top: 1px solid #f0f0f0;
}
.row-icon {
  font-size: 18px;
  color: rgba(0, 0, 0, 0.65);
}
.row dt {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
}
.row dd {
  margin: 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.88);
  overflow-wrap: anywhere;
}
.actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
@media (max-width: 560px) {
  .actions {
    grid-template-columns: 1fr;
  }
  .actions :deep(.ant-btn-primary) {
    order: -1;
  }
  .row {
    grid-template-columns: 24px minmax(0, 1fr);
  }
  .row dd {
    grid-column: 2;
  }
}
</style>
