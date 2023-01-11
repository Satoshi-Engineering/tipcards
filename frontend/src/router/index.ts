import { createRouter, createWebHistory } from 'vue-router'

import i18n from '@/modules/initI18n'

const PageIndex = () => import('@/pages/PageIndex.vue')
const PageLanding = () => import('@/pages/PageLanding.vue')
const PageCards = () => import('@/pages/PageCards.vue')
const PageFunding = () => import('@/pages/PageFunding.vue')
const PageAuthDevelopment = () => import('@/pages/PageAuthDevelopment.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: (to, from) => {
    if (to.name === from.name) return {}
    return { top: 0 }
  },
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
      meta: { title: () => i18n.global.t('landing.title') },
    },
    {
      path: '/preview/',
      name: 'preview',
      component: PageLanding,
      meta: { title: () => i18n.global.t('landing.titlePreview') },
    },
    {
      path: '/cards/:setId?/:settings?',
      name: 'cards',
      component: PageCards,
      meta: { title: () => false },
    },
    {
      path: '/funding/:cardHash',
      name: 'funding',
      component: PageFunding,
      meta: { title: () => i18n.global.t('funding.title') },
    },
    {
      path: '/auth',
      name: 'auth',
      component: PageAuthDevelopment,
    },
  ],
})

export default router
