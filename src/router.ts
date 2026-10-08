import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/categories' },
    { path: '/categories', name: 'categories', component: () => import('@/views/CategoriesView.vue') },
    { path: '/categories/:id', name: 'showcase', component: () => import('@/views/ShowcaseView.vue') },
    { path: '/my-bookings', name: 'my-bookings', component: () => import('@/views/MyBookingsView.vue') },
  ],
})
