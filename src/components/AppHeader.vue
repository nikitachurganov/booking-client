<script setup lang="ts">
import {
  BellOutlined,
  DownOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue'
import logo from '@/assets/logo.png'
</script>

<template>
  <header class="header">
    <div class="left">
      <router-link to="/" class="logo">
        <img :src="logo" alt="FEFU One" class="logo-img" />
        <span class="logo-text">FEFU One</span>
      </router-link>
      <a-divider type="vertical" class="hide-sm" />
      <a-input class="search hide-sm" variant="borderless" placeholder="Поиск по сервису">
        <template #prefix><SearchOutlined /></template>
      </a-input>
    </div>
    <div class="right">
      <a-button type="text" class="role hide-sm">
        Администратор системы <DownOutlined class="role-arrow" />
      </a-button>
      <a-divider type="vertical" class="hide-sm" />
      <a-button type="text" shape="circle" aria-label="Помощь" class="hide-sm"><QuestionCircleOutlined /></a-button>
      <a-button type="text" shape="circle" aria-label="Уведомления"><BellOutlined /></a-button>
      <a-divider type="vertical" class="hide-sm" />
      <div class="profile">
        <a-avatar shape="square" :size="40" class="avatar">U</a-avatar>
        <div class="profile-text hide-sm">
          <div class="name">Иванов Иван Иванович</div>
          <div class="email">ivanov.ii@dvfu.ru</div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 7px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}
.left {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 12px;
  color: #000;
  text-decoration: none;
}
.logo-img {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  object-fit: cover;
}
.logo-text {
  font-size: 19px;
  font-weight: 700;
  line-height: 24px;
  white-space: nowrap;
}
.search {
  width: 280px;
}
.right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.role-arrow {
  font-size: 10px;
  color: rgba(0, 0, 0, 0.45);
}
.profile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
}
.avatar {
  background: rgba(0, 0, 0, 0.25);
  font-size: 18px;
}
.name {
  font-size: 15px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.88);
}
.email {
  font-size: 13px;
  line-height: 16px;
  color: rgba(0, 0, 0, 0.6);
}
@media (max-width: 768px) {
  .header {
    gap: 8px;
    padding: 8px 12px;
  }
  .hide-sm {
    display: none !important;
  }
  .logo {
    padding-right: 0;
  }
  .profile {
    padding: 0;
  }
  .right :deep(.ant-btn) {
    width: 44px;
    height: 44px;
  }
}
</style>

