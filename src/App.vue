<script setup lang="ts">
import ruRU from 'ant-design-vue/es/locale/ru_RU'
import AppHeader from '@/components/AppHeader.vue'
</script>

<template>
  <a-config-provider :locale="ruRU" :theme="{ token: { borderRadius: 6 } }">
    <div class="app">
      <AppHeader />
      <router-view />
    </div>
  </a-config-provider>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>

