import { computed } from 'vue'
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router'

export default () => {
  const route = useRoute()
  const router = useRouter()

  const showBacklink = computed(() => routeUsesBacklink.value)

  const routeUsesBacklink = computed( () =>
    route.meta.backlink === true
    || typeof route.meta.backlink === 'string'
    || typeof route.meta.backlink === 'function',
  )

  const routeDefinesBackTarget = computed(() =>
    typeof route.meta.backlink === 'string'
    || typeof route.meta.backlink === 'function',
  )

  const to = computed<RouteLocationRaw>(() => {
    if (typeof route.meta.backlink === 'string') {
      return { name: route.meta.backlink, params: { lang: route.params.lang } } as RouteLocationRaw
    }

    if (typeof route.meta.backlink === 'function') {
      return route.meta.backlink(route)
    }

    return historyBackTo.value
  })

  const historyBackTo = computed<RouteLocationRaw>(() => {
    const home: RouteLocationRaw = { name: 'home', params: { lang: route.params.lang } }
    if (!isReferrerFromApplication.value) {
      return home
    }
    try {
      return new URL(document.referrer).pathname
    } catch {
      return home
    }
  })

  const isReferrerFromApplication = computed(() => {
    try {
      if (new URL(document.referrer).origin === location.origin && document.referrer !== document.location.href) {
        return true
      }
    } catch {
      return false
    }
    return false
  })

  const onBacklinkClick = (event: Event) => {
    if (shouldWeGoBackInHistory.value) {
      event.preventDefault()
      goBack()
    } else {
      return followDefaultAction()
    }
  }

  const goBack = () => {
    if (shouldWeGoBackInHistory.value) {
      router.go(-1)
    } else {
      router.push(to.value)
    }
  }

  const shouldWeGoBackInHistory = computed(() =>
    canWeGoBackInHistory.value
    && (
      !routeDefinesBackTarget.value
      || routeBackTargetIsSameAsReferrer.value
    ),
  )

  const canWeGoBackInHistory = computed(() => history.length > 1 && isReferrerFromApplication.value)

  const routeBackTargetIsSameAsReferrer = computed(() => {
    if (!canWeGoBackInHistory.value) {
      return false
    }
    return router.resolve(to.value).name === router.resolve(historyBackTo.value).name
  })

  const followDefaultAction = () => true

  return {
    showBacklink,
    to,
    onBacklinkClick,
    goBack,
  }
}
