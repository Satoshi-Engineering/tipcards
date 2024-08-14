<template>
  <nav class="w-full bg-white animate-fade-in" data-test="the-main-nav">
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
      <template v-if="authStore.isLoggedIn">
        <menu>
          <li>
            <MainNavItem
              :to="{ name: 'user-account', params: { lang: $route.params.lang } }"
              :label="userDisplayName != null && userDisplayName.length > 0 ? userDisplayName : $t('general.userAccount')"
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
            :label="$t('auth.buttonLogout')"
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
import useProfile from '@/stores/useProfile'

defineEmits(['itemSelected'])

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

const modalLoginStore = useModalLoginStore()
const { showModalLogin } = storeToRefs(modalLoginStore)

const { userDisplayName } = useProfile()
</script>
