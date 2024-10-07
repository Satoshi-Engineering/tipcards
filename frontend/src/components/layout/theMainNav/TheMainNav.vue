<template>
  <nav
    id="the-main-nav"
    class="w-full bg-white animate-fade-in"
    data-test="the-main-nav"
  >
    <CenterContainer class="h-[calc(100dvh-56px)] overflow-y-auto py-6">
      <menu>
        <li>
          <MainNavItem
            :to="{ name: 'home', params: { lang: $route.params.lang } }"
            :label="$t('nav.index')"
            @click="$emit('itemSelected')"
          >
            <IconHouseDoorFill class="text-2xl" />
          </MainNavItem>
        </li>
        <li>
          <MainNavItem
            :to="{ name: 'sets', params: { lang: $route.params.lang } }"
            :label="$t('nav.sets')"
            @click="$emit('itemSelected')"
          >
            <IconBookmarkFill />
          </MainNavItem>
        </li>
        <li>
          <MainNavItem
            :to="{ name: 'faqs', params: { lang: $route.params.lang } }"
            :label="$t('nav.faqs')"
            @click="$emit('itemSelected')"
          >
            <IconQuestionmark />
          </MainNavItem>
        </li>
        <li>
          <MainNavItem
            :to="{ name: 'about', params: { lang: $route.params.lang } }"
            :label="$t('nav.about')"
            @click="$emit('itemSelected')"
          >
            <IconLightbulbFill />
          </MainNavItem>
        </li>
      </menu>
      <hr class="my-3 border-t border-white-50">
      <template v-if="canAccessStatistics">
        <menu>
          <li v-if="canAccessStatistics">
            <MainNavItem
              :to="{ name: 'statistics', params: { lang: $route.params.lang } }"
              :label="$t('nav.statistics')"
              @click="$emit('itemSelected')"
            >
              <IconBarChartFill />
            </MainNavItem>
          </li>
        </menu>
        <hr class="my-3 border-t border-white-50">
      </template>
      <template v-if="authStore.isLoggedIn">
        <menu>
          <li data-test="the-main-nav-logged-in">
            <MainNavItem
              :to="{ name: 'user-account', params: { lang: $route.params.lang } }"
              :label="userDisplayName != null && userDisplayName.length > 0 ? userDisplayName : $t('general.userAccount')"
              active-class="text-bluegrey"
              @click="$emit('itemSelected')"
            >
              <IconPersonCircle />
            </MainNavItem>
            <MainNavItem
              v-if="userDisplayName != null && userDisplayName.length > 0"
              class="!text-base !font-normal !pt-0"
              :to="{ name: 'user-account', params: { lang: $route.params.lang } }"
              :label="$t('nav.goToAccount')"
              @click="$emit('itemSelected')"
            />
          </li>
        </menu>
        <hr class="my-3 border-t border-white-50">
      </template>
      <menu>
        <li v-if="isLoggedIn">
          <MainNavItem
            data-test="main-nav-link-logout"
            class="!text-base"
            :label="$t('general.logout')"
            @click="async () => {
              await authStore.logout()
              $emit('itemSelected')
            }"
          >
            <IconArrowLeftCircleFill class="rtl:rotate-180" />
          </MainNavItem>
        </li>
        <li v-else>
          <MainNavItem
            data-test="main-nav-link-login"
            :label="$t('general.login')"
            @click="() => {
              showModalLogin = true
              $emit('itemSelected')
            }"
          >
            <IconArrowRightCircleFill class="rtl:rotate-180" />
          </MainNavItem>
        </li>
      </menu>
    </CenterContainer>
  </nav>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { canAccessStatistics as hasStatisticsPermissions } from '@shared/modules/checkAccessTokenPermissions'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import MainNavItem from '@/components/layout/theMainNav/components/MainNavItem.vue'
import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'
import IconQuestionmark from '@/components/icons/IconQuestionmark.vue'
import IconArrowLeftCircleFill from '@/components/icons/IconArrowLeftCircleFill.vue'
import IconArrowRightCircleFill from '@/components/icons/IconArrowRightCircleFill.vue'
import IconHouseDoorFill from '@/components/icons/IconHouseDoorFill.vue'
import IconBookmarkFill from '@/components/icons/IconBookmarkFill.vue'
import IconLightbulbFill from '@/components/icons/IconLightbulbFill.vue'
import IconPersonCircle from '@/components/icons/IconPersonCircle.vue'
import IconBarChartFill from '@/components/icons/IconBarChartFill.vue'
import { useProfileStore } from '@/stores/profile'

defineEmits(['itemSelected'])

const authStore = useAuthStore()
const { isLoggedIn, accessTokenPayload } = storeToRefs(authStore)

const modalLoginStore = useModalLoginStore()
const { showModalLogin } = storeToRefs(modalLoginStore)

const profileStore = useProfileStore()
const { userDisplayName } = storeToRefs(profileStore)

const canAccessStatistics = computed(() => {
  if (accessTokenPayload.value == null) {
    return false
  }
  return hasStatisticsPermissions(accessTokenPayload.value)
})
</script>
