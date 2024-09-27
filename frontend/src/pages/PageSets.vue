<template>
  <TheLayout login-banner>
    <CenterContainer class="mb-10">
      <BackLink :to="{ name: 'home', params: { lang: $route.params.lang }}">
        {{ t('sets.backLink') }}
      </BackLink>
      <div class="flex justify-between">
        <HeadlineDefault
          level="h1"
          styling="h2"
          data-test="headline"
        >
          {{ t('sets.title') }}
        </HeadlineDefault>
        <ButtonIcon
          icon="plus"
          size="small"
          variant="yellow"
          class="-mt-5"
          data-test="button-new-set"
          :to="{ name: 'cards', params: { lang: $route.params.lang } }"
        >
          {{ t('sets.newSet') }}
        </ButtonIcon>
      </div>
      <div v-if="!isLoggedIn" data-test="please-login-section">
        <ParagraphDefault>
          {{ t('sets.loginToSeeYourSets') }}
        </ParagraphDefault>
        <LinkDefault @click="showModalLogin = true">
          {{ t('general.login') }}
        </LinkDefault>
      </div>
      <div
        v-if="isLoggedIn"
        class="flex flex-col"
        data-test="logged-in"
      >
        <IconAnimatedLoadingWheel
          v-if="fetching"
          class="w-10 h-auto mx-auto my-10"
        />
        <UserErrorMessages
          v-else-if="fetchingUserErrorMessages.length > 0"
          :user-error-messages="fetchingUserErrorMessages"
        />
        <ParagraphDefault
          v-else-if="sets.length < 1"
          data-test="sets-list-empty"
        >
          {{ t('sets.noSavedCardsSetsMessage') }}
        </ParagraphDefault>
        <div v-else data-test="sets-list-with-data">
          <ParagraphDefault>
            {{ t('sets.description') }}
          </ParagraphDefault>
          <ListSets :sets="sets" class="my-7" />
        </div>
      </div>
      <SetsInLocalStorageWarning class="mt-8" />
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import TheLayout from '@/components/layout/TheLayout.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import BackLink from '@/components/BackLink.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import UserErrorMessages from '@/components/UserErrorMessages.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonIcon from '@/components/buttons/ButtonIcon.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'

import SetsInLocalStorageWarning from '@/components/SetsInLocalStorageWarning.vue'

import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'
import useSets from '@/modules/useSets'
import ListSets from '@/components/ListSets.vue'
import IconAnimatedLoadingWheel from '@/components/icons/IconAnimatedLoadingWheel.vue'

const { t } = useI18n()
const { isLoggedIn } = storeToRefs(useAuthStore())
const modalLoginStore = useModalLoginStore()

const { showModalLogin } = storeToRefs(modalLoginStore)

const { sets, fetching, getAllSets, fetchingUserErrorMessages } = useSets()

onMounted(getAllSets)
</script>
