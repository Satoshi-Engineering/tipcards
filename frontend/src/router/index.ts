import { createRouter, createWebHistory } from 'vue-router'

import { about, type RouteAbout } from '@/router/pages/about'
import { bulkWithdraw, type RouteBulkWithdraw } from '@/router/pages/bulkWithdraw'
import { cards, type RouteCards } from '@/router/pages/cards'
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
  styleGuideTypographyAndButtons, type RouteStyleGuideTypographyAndButtons,
  styleGuideIcons, type RouteStyleGuideIcons,
  styleGuideComponents, type RouteStyleGuideComponents,
} from '@/router/pages/styleGuide'
import { userAccount, type RouteUserAccount } from '@/router/pages/userAccount'

export interface RouteNamedMap {
  about: RouteAbout,
  'bulk-withdraw': RouteBulkWithdraw,
  cards: RouteCards,
  faqs: RouteFaqs,
  funding: RouteFunding,
  home: RouteHome,
  landing: RouteLanding,
  'local-storage-sets': RouteLocalStorageSets,
  'set-funding': RouteSetFunding,
  sets: RouteSets,
  statistics: RouteStatistics,
  'style-guide': RouteStyleGuide,
  'style-guide/typography-and-buttons': RouteStyleGuideTypographyAndButtons,
  'style-guide/icons': RouteStyleGuideIcons,
  'style-guide/components': RouteStyleGuideComponents,
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
    faqs,
    funding,
    home,
    landing,
    localStorageSets,
    setFunding(() => router),
    sets,
    statistics,
    styleGuide,
    styleGuideTypographyAndButtons,
    styleGuideIcons,
    styleGuideComponents,
    userAccount,
  ],
})

export default router
