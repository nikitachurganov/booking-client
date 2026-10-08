<script setup lang="ts">
import type { ObjectTag } from '@/api/objects'

defineProps<{ kind: ObjectTag }>()

const labels: Record<ObjectTag, string> = {
  training: 'Требуется обучение',
  permit: 'Требуется допуск',
  operator: 'Работа с оператором',
}
</script>

<template>
  <span class="tag" :class="kind">{{ labels[kind] }}</span>
</template>

<style scoped>
.tag {
  padding: 0 6px;
  font-size: 12px;
  line-height: 20px;
  white-space: nowrap;
  border: 1px solid;
  border-radius: 4px;
}
.training {
  color: #d48806;
  background: #fffbe6;
  border-color: #ffe58f;
}
.permit {
  color: #cf1322;
  background: #fff1f0;
  border-color: #ffa39e;
}
.operator {
  color: #0958d9;
  background: #e6f4ff;
  border-color: #91caff;
}
</style>
