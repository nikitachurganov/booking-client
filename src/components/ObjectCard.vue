<script setup lang="ts">
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  PictureOutlined,
  RightOutlined,
} from '@ant-design/icons-vue'
import type { BookingObject } from '@/api/objects'
import ObjectTag from '@/components/ObjectTag.vue'

withDefaults(defineProps<{ item: BookingObject; layout?: 'grid' | 'list' }>(), { layout: 'grid' })

const slotsWord = (n: number) => {
  const m = n % 10
  const w = n % 100 >= 11 && n % 100 <= 14 ? 'слотов' : m === 1 ? 'слот' : m >= 2 && m <= 4 ? 'слота' : 'слотов'
  return `еще ${n} ${w}`
}
</script>

<template>
  <article
    class="object-card"
    :class="[`layout-${layout}`, { unavailable: !item.available }]"
    role="button"
    tabindex="0"
    @keydown.enter.self.prevent="($event.currentTarget as HTMLElement).click()"
  >
    <div class="image">
      <img v-if="item.image" :src="item.image" :alt="item.title" loading="lazy" />
      <PictureOutlined v-else class="placeholder" />
      <div v-if="layout === 'grid' && item.tags.length" class="tags">
        <ObjectTag v-for="t in item.tags" :key="t" :kind="t" />
      </div>
    </div>

    <div class="body">
      <h3 class="title" :title="item.title">{{ item.title }}</h3>
      <ul class="info">
        <li class="slot">
          <ClockCircleOutlined />
          <template v-if="item.nearestSlot">
            <span>{{ item.nearestSlot }}</span>
            <template v-if="item.extraSlots"><i class="dot" /><span>{{ slotsWord(item.extraSlots) }}</span></template>
          </template>
          <span v-else>Нет свободных слотов</span>
        </li>
        <li>
          <EnvironmentOutlined />
          <span>{{ item.building }}</span><i class="dot" /><span>{{ item.room }}</span>
        </li>
      </ul>
      <div v-if="layout === 'list' && item.tags.length" class="chips">
        <ObjectTag v-for="t in item.tags" :key="t" :kind="t" />
      </div>
    </div>

    <div v-if="layout === 'list'" class="aside">
      <div class="aside-slot">
        <span class="aside-label">Ближайший слот</span>
        <template v-if="item.nearestSlot">
          <span class="aside-value">{{ item.nearestSlot }}</span>
          <span v-if="item.extraSlots" class="aside-more">{{ slotsWord(item.extraSlots) }}</span>
        </template>
        <span v-else class="aside-value">Нет свободных слотов</span>
      </div>
      <RightOutlined class="chevron" />
    </div>
  </article>
</template>

<style scoped>
.object-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  padding: 8px;
  background: #fff;
  cursor: pointer;
  border-radius: 8px;
  transition: box-shadow 0.2s;
}
.object-card:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: 2px;
}
.object-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
.body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

/* --- list layout --- */
.layout-list {
  flex-direction: row;
  gap: 12px;
  align-items: stretch;
  height: auto;
  border: 1px solid #f0f0f0;
  transition: border-color 0.2s, background-color 0.2s;
}
.layout-list:hover {
  background: #fafafa;
  border-color: #d9d9d9;
  box-shadow: none;
}
.layout-list .image {
  flex: none;
  width: 96px;
  height: 72px;
}
.layout-list .body {
  flex: 1;
  gap: 4px;
  justify-content: center;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.aside {
  display: flex;
  flex: none;
  gap: 16px;
  align-items: center;
  min-width: 200px;
  padding: 0 8px 0 16px;
  border-left: 1px solid #f0f0f0;
}
.aside-slot {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}
.aside-label {
  font-size: 12px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.45);
}
.aside-value {
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.88);
}
.aside-more {
  font-size: 13px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.65);
}
.chevron {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}
@media (min-width: 769px) {
  .layout-list .slot {
    display: none;
  }
}
@media (max-width: 768px) {
  .layout-list .aside {
    display: none;
  }
  /* теги в одну строку со скроллом вбок */
  .layout-list .chips {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 16px), transparent);
    mask-image: linear-gradient(to right, #000 calc(100% - 16px), transparent);
  }
  .layout-list .chips::-webkit-scrollbar {
    display: none;
  }
  .layout-list .chips > * {
    flex: none;
  }
}
@media (max-width: 560px) {
  .layout-list {
    gap: 12px;
    align-items: flex-start;
  }
  .layout-list .image {
    width: 112px;
    height: 112px;
  }
  .layout-list .body {
    justify-content: flex-start;
  }
}

/* --- grid layout on phones: two columns --- */
@media (max-width: 560px) {
  .layout-grid {
    gap: 8px;
    padding: 6px;
  }
  .layout-grid .image {
    height: 160px;
  }
  .layout-grid .tags {
    top: 4px;
    right: 4px;
    left: 4px;
  }
  .layout-grid .body {
    gap: 6px;
    padding: 0 2px 2px;
  }
  .layout-grid .title {
    display: -webkit-box;
    min-height: 40px;
    font-size: 14px;
    white-space: normal;
    word-break: break-word;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .layout-grid .info {
    font-size: 13px;
    line-height: 20px;
  }
}

/* --- common --- */
.unavailable .image img {
  opacity: 0.5;
}
.unavailable .title,
.unavailable .info,
.unavailable .aside-value {
  color: rgba(0, 0, 0, 0.45);
}
.image {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
  border-radius: 4px;
}
.image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.placeholder {
  font-size: 32px;
  color: rgba(0, 0, 0, 0.25);
}
.tags {
  position: absolute;
  top: 8px;
  right: 8px;
  left: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.title {
  margin: 0;
  overflow: hidden;
  font-size: 15px;
  font-weight: 700;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.88);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0;
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.65);
  list-style: none;
}
.info li {
  display: flex;
  flex-wrap: wrap;
  gap: 0 4px;
  align-items: center;
}
.info :deep(.anticon) {
  font-size: 12px;
}
.dot {
  width: 4px;
  height: 4px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 50%;
}
</style>
