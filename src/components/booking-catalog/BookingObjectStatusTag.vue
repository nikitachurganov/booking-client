<script setup>
const props = defineProps({
  status: {
    type: String,
    required: true,
  },
});

const statusConfig = {
  available: {
    color: 'success',
    label: 'Доступно',
  },
  noSlots: {
    color: 'warning',
    label: 'Нет слотов',
  },
  moderation: {
    color: 'processing',
    label: 'Требуется подтверждение',
  },
  restricted: {
    color: 'error',
    label: 'Доступ ограничен',
  },
  documents: {
    color: 'purple',
    label: 'Нужны документы',
  },
  unavailable: {
    color: 'default',
    label: 'Недоступно',
  },
};
</script>

<template>
  <a-tag :color="statusConfig[props.status]?.color">
    {{ statusConfig[props.status]?.label ?? props.status }}
  </a-tag>
</template>
