import { createRouter, createWebHistory, type RouteLocationNormalizedLoaded } from 'vue-router'

import i18n from '@/modules/initI18n'
import LOCALES from '@shared/modules/i18n/locales'

import PageIndex from '@/pages/PageIndex.vue'

const PageHome = () => import('@/pages/PageHome.vue')
const PageLanding = () => import('@/pages/PageLanding.vue')
const PageSets = () => import('@/pages/PageSets.vue')
const PageCards = () => import('@/pages/PageCards.vue')
const PageFunding = () => import('@/pages/PageFunding.vue')
const PageSetFunding = () => import('@/pages/PageSetFunding.vue')
const PageAbout = () => import('@/pages/PageAbout.vue')
const PageStatistics = () => import('@/pages/statistics/PageStatistics.vue')
const PageUserAccount = () => import('@/pages/PageUserAccount.vue')
const PageStyleGuide = () => import('@/pages/styleGuide/PageStyleGuide.vue')
const PageBulkWithdraw = () => import('@/pages/bulkWithdraw/PageBulkWithdraw.vue')
const PageFAQs = () => import('@/pages/PageFAQs.vue')
const PageLocalStorageSets = () => import('@/pages/PageLocalStorageSets.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: (to, from) => {
    if (to.name === from.name) { return {} }
    return { top: 0 }
  },
  routes: [
    {
      path: `/:lang(${Object.keys(LOCALES).join('|')})?`,
      children: [
        {
          path: ':',
          name: 'index',
          component: PageIndex,
        },
        {
          path: 'home',
          name: 'home',
          component: PageHome,
        },
        {
          path: 'landing/:cardHash?',
          name: 'landing',
          component: PageLanding,
          meta: {
            title: () => i18n.global.t('landing.title'),
            backlink: true,
          },
        },
        {
          path: 'preview',
          name: 'preview',
          redirect: { name: 'landing' },
        },
        {
          path: 'sets',
          name: 'sets',
          component: PageSets,
          meta: {
            title: () => i18n.global.t('sets.title'),
            backlink: 'home',
          },
        },
        {
          path: 'cards/:setId?/:settings?',
          name: 'cards',
          component: PageCards,
          meta: {
            title: () => false, // title will be set in the page component
            backlink: 'index',
          },
        },
        {
          path: 'funding/:cardHash',
          name: 'funding',
          component: PageFunding,
          meta: {
            title: () => i18n.global.t('funding.title'),
            backlink: true,
          },
        },
        {
          path: 'set-funding/:setId/:settings?',
          name: 'set-funding',
          component: PageSetFunding,
          meta: {
            title: () => i18n.global.t('setFunding.title'),
            backlink: (route: RouteLocationNormalizedLoaded) =>
              router.resolve({
                name: 'cards',
                params: {
                  lang: route.params.lang,
                  setId: route.params.setId,
                  settings: route.params.settings,
                },
              }),
          },
        },
        {
          path: 'about',
          name: 'about',
          component: PageAbout,
          meta: {
            title: () => 'About',
            backlink: true,
          },
        },
        {
          path: 'user-account',
          name: 'user-account',
          component: PageUserAccount,
          meta: {
            title: () => i18n.global.t('userAccount.title'),
            backlink: true,
          },
        },
        {
          path: 'statistics',
          name: 'statistics',
          component: PageStatistics,
          meta: { title: () => 'Statistics' },
        },
        {
          path: 'bulk-withdraw/:setId?/:settings?',
          name: 'bulk-withdraw',
          component: PageBulkWithdraw,
          meta: {
            title: () => i18n.global.t('bulkWithdraw.title'),
            backlink: (route: RouteLocationNormalizedLoaded) =>
              router.resolve({
                name: 'cards',
                params: {
                  lang: route.params.lang,
                  setId: route.params.setId,
                  settings: route.params.settings,
                },
              }),
          },
        },
        {
          path: 'faqs',
          name: 'faqs',
          component: PageFAQs,
          meta: { title: () => 'FAQs' },
        },
        {
          path: 'style-guide',
          name: 'style-guide',
          component: PageStyleGuide,
          meta: { title: () => 'Style Guide' },
        },
        {
          path: 'local-storage-sets',
          name: 'local-storage-sets',
          component: PageLocalStorageSets,
        },
      ],
    },
  ],
})

export default router
