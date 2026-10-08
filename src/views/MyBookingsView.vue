<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <main style="padding: 20px">
    <a-button @click="router.push({ name: 'categories' })">← К категориям</a-button>
    <a-result title="Мои бронирования" sub-title="Раздел в разработке" />
  </main>
</template>
