import { createRouter, createWebHistory } from 'vue-router'

import { about, type RouteAbout } from '@/router/pages/about'
import { bulkWithdraw, type RouteBulkWithdraw } from '@/router/pages/bulkWithdraw'
import { cards, type RouteCards } from '@/router/pages/cards'
import { dashboard, type RouteDashboard } from '@/router/pages/dashboard'
import { faqs, type RouteFaqs } from '@/router/pages/faqs'
import { funding, type RouteFunding } from '@/router/pages/funding'
import { history, type RouteHistory } from './pages/history'
import { home, type RouteHome } from '@/router/pages/home'
import { landing, type RouteLanding } from '@/router/pages/landing'
import { localStorageSets, type RouteLocalStorageSets } from '@/router/pages/localStorageSets'
import { notFound, type RouteNotFound } from './pages/notFound'
import { set, type RouteSet } from '@/router/pages/set'
import { setFunding, type RouteSetFunding } from '@/router/pages/setFunding'
import { setPrinting, type RouteSetPrinting } from '@/router/pages/setPrinting'
import { sets, type RouteSets } from '@/router/pages/sets'
import { statistics, type RouteStatistics } from '@/router/pages/statistics'
import {
  styleGuide, type RouteStyleGuide,
  styleGuideComponents, type RouteStyleGuideComponents,
  styleGuideForms, type RouteStyleGuideForms,
  styleGuideIcons, type RouteStyleGuideIcons,
  styleGuideTypographyAndButtons, type RouteStyleGuideTypographyAndButtons,
} from '@/router/pages/styleGuide'
import { userAccount, type RouteUserAccount } from '@/router/pages/userAccount'
import { privacyPolicy, type RoutePrivacyPolicy } from './pages/privacyPolicy'

export interface RouteNamedMap {
  about: RouteAbout,
  'bulk-withdraw': RouteBulkWithdraw,
  cards: RouteCards,
  dashboard: RouteDashboard,
  faqs: RouteFaqs,
  funding: RouteFunding,
  history: RouteHistory,
  home: RouteHome,
  landing: RouteLanding,
  'local-storage-sets': RouteLocalStorageSets,
  'not-found': RouteNotFound,
  'privacy-policy': RoutePrivacyPolicy,
  set: RouteSet,
  'set-funding': RouteSetFunding,
  'set-printing': RouteSetPrinting,
  sets: RouteSets,
  statistics: RouteStatistics,
  'style-guide': RouteStyleGuide,
  'style-guide/components': RouteStyleGuideComponents,
  'style-guide/forms': RouteStyleGuideForms,
  'style-guide/icons': RouteStyleGuideIcons,
  'style-guide/typography-and-buttons': RouteStyleGuideTypographyAndButtons,
  'user-account': RouteUserAccount,
}

declare module 'vue-router' {
  interface TypesConfig {
    RouteNamedMap: RouteNamedMap
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: (to, from) => {
    if (to.name === from.name) { return {} }
    return { top: 0, behavior: 'instant' }
  },
  routes: [
    about,
    bulkWithdraw(() => router),
    cards,
    dashboard,
    faqs,
    funding,
    history,
    home,
    landing,
    localStorageSets,
    notFound,
    privacyPolicy,
    set,
    setFunding(() => router),
    setPrinting,
    sets,
    statistics,
    styleGuide,
    styleGuideComponents,
    styleGuideForms,
    styleGuideIcons,
    styleGuideTypographyAndButtons,
    userAccount,
  ],
})

export default router
