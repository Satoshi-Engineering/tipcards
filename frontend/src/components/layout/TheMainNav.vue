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
            :to="{ name: 'cards', params: { lang: $route.params.lang } }"
            :label="$t('nav.cards')"
            @click="$emit('itemSelected')"
          >
            <BIconMicrosoft />
          </MainNavItem>
        </li>
        <li>
          <MainNavItem
            :to="{ name: 'landing', params: { lang: $route.params.lang } }"
            :label="$t('nav.landing')"
            @click="$emit('itemSelected')"
          >
            <BIconQrCodeScan />
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
      <menu>
        <li v-if="isLoggedIn">
          <MainNavItem
            :to="{ name: 'user-account', params: { lang: $route.params.lang } }"
            :label="$t('general.userAccount')"
            @click="$emit('itemSelected')"
          >
            <BIconPersonCircle />
          </MainNavItem>
          <MainNavItem
            class="!text-base !font-normal !pt-0"
            :to="{ name: 'user-account', params: { lang: $route.params.lang } }"
            :label="$t('nav.goToAccount')"
            @click="$emit('itemSelected')"
          />
        </li>
        <li v-else>
          <MainNavItem
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
      <template v-if="isLoggedIn">
        <hr class="my-3 border-t border-white-50">
        <menu>
          <li>
            <MainNavItem
              class="!text-base"
              :to="{ name: 'user-account', params: { lang: $route.params.lang } }"
              :label="$t('auth.buttonLogout')"
              @click="async () => {
                await authStore.logout()
                $emit('itemSelected')
              }"
            >
              <BIconArrowLeftCircleFill class="rtl:rotate-180" />
            </MainNavItem>
          </li>
        </menu>
      </template>
    </CenterContainer>
  </nav>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { BIconArrowLeftCircleFill, BIconArrowRightCircleFill, BIconHouseDoorFill, BIconLightbulbFill, BIconMicrosoft, BIconPersonCircle, BIconQrCodeScan } from 'bootstrap-icons-vue'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import MainNavItem from '@/components/layout/MainNavItem.vue'
import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'

defineEmits(['itemSelected'])

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

const modalLoginStore = useModalLoginStore()
const { showModalLogin } = storeToRefs(modalLoginStore)
</script>
