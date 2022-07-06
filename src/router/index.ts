import { createRouter, createWebHistory } from 'vue-router'

import PageIndex from '@/pages/PageIndex.vue'
import PageLanding from '@/pages/PageLanding.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      name: 'home',
      component: PageIndex,
    },
    {
      path: '/landing/',
      name: 'landing',
      component: PageLanding,
    },
  ],
})

export default router
