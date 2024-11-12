import { createRouter, createWebHistory } from 'vue-router'

import { about, type RouteAbout } from '@/router/pages/about'
import { bulkWithdraw, type RouteBulkWithdraw } from '@/router/pages/bulkWithdraw'
import { cards, type RouteCards } from '@/router/pages/cards'
import { dashboard, type RouteDashboard } from '@/router/pages/dashboard'
import { faqs, type RouteFaqs } from '@/router/pages/faqs'
import { funding, type RouteFunding } from '@/router/pages/funding'
import { home, type RouteHome } from '@/router/pages/home'
import { landing, type RouteLanding } from '@/router/pages/landing'
import { localStorageSets, type RouteLocalStorageSets } from '@/router/pages/localStorageSets'
import { setFunding, type RouteSetFunding } from '@/router/pages/setFunding'
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

export interface RouteNamedMap {
  about: RouteAbout,
  'bulk-withdraw': RouteBulkWithdraw,
  cards: RouteCards,
  dashboard: RouteDashboard,
  faqs: RouteFaqs,
  funding: RouteFunding,
  home: RouteHome,
  landing: RouteLanding,
  'local-storage-sets': RouteLocalStorageSets,
  'set-funding': RouteSetFunding,
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
    return { top: 0 }
  },
  routes: [
    about,
    bulkWithdraw(() => router),
    cards,
    dashboard,
    faqs,
    funding,
    home,
    landing,
    localStorageSets,
    setFunding(() => router),
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
