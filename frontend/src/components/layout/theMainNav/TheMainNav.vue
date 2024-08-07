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
            <BIconHouseDoorFill class="text-2xl" />
          </MainNavItem>
        </li>
        <li>
          <MainNavItem
            :to="{ name: 'sets', params: { lang: $route.params.lang } }"
            :label="$t('nav.sets')"
            @click="$emit('itemSelected')"
          >
            <BIconBookmarkFill />
          </MainNavItem>
        </li>
        <li>
          <MainNavItem
            :to="{ name: 'cards', params: { lang: $route.params.lang } }"
            :label="$t('nav.cards')"
            @click="$emit('itemSelected')"
          >
            <BIconMicrosoft />
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
            <BIconLightbulbFill />
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
              <BIconPersonCircle />
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
            <BIconArrowLeftCircleFill class="rtl:rotate-180" />
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
            <BIconArrowRightCircleFill />
          </MainNavItem>
        </li>
      </menu>
    </CenterContainer>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { BIconArrowLeftCircleFill, BIconArrowRightCircleFill, BIconBookmarkFill, BIconHouseDoorFill, BIconLightbulbFill, BIconMicrosoft, BIconPersonCircle } from 'bootstrap-icons-vue'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import MainNavItem from '@/components/layout/theMainNav/components/MainNavItem.vue'
import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'
import IconQuestionmark from '@/components/icons/IconQuestionmark.vue'

defineEmits(['itemSelected'])

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

const modalLoginStore = useModalLoginStore()
const { showModalLogin } = storeToRefs(modalLoginStore)

const userDisplayName = ref('')
</script>
