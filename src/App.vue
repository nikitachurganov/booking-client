<script setup>
import ruRU from 'ant-design-vue/es/locale/ru_RU';
import BookingObjectsCatalogPage from './components/booking-catalog/BookingObjectsCatalogPage.vue';
</script>

<template>
  <a-config-provider
    :locale="ruRU"
    :theme="{
      token: {
        colorPrimary: '#2d82cf',
        colorBgLayout: '#f5f5f5',
        colorBgContainer: '#ffffff',
        colorBorder: '#d9d9d9',
        colorSplit: 'rgba(0, 0, 0, 0.06)',
        colorText: 'rgba(0, 0, 0, 0.88)',
        colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
        colorTextTertiary: 'rgba(0, 0, 0, 0.45)',
        borderRadius: 6,
        fontSize: 14,
        lineHeight: 1.5714285714,
      },
    }"
  >
    <BookingObjectsCatalogPage />
  </a-config-provider>
</template>
