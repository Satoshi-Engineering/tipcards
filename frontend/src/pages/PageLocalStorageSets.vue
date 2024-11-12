<template>
  <TheLayout>
    <CenterContainer class="flex flex-col">
      <BackLink :to="{ name: 'sets', params: { lang: $route.params.lang } }" />
      <HeadlineDefault level="h1" styling="h2">
        {{ t('localStorageDeprecation.setsPage.headline') }}
      </HeadlineDefault>
      <ParagraphDefault>
        {{ t('localStorageDeprecation.setsPage.text') }}
      </ParagraphDefault>
      <ParagraphDefault class="mb-6">
        {{ t('localStorageDeprecation.setsPage.explanation') }}
      </ParagraphDefault>
      <div
        v-if="sets.length < 1"
        class="flex flex-col items-center text-sm text-grey"
      >
        <ParagraphDefault>
          {{ t('localStorageDeprecation.setsPage.noSets') }}
        </ParagraphDefault>
        <ButtonDefault
          :to="{ name: 'home', params: { lang: $route.params.lang } }"
          variant="secondary"
        >
          {{ t('localStorageDeprecation.setsPage.buttonBack') }}
        </ButtonDefault>
      </div>
      <div v-else>
        <ListSets
          :sets="sets"
          no-cards-summary
          class="my-7"
          data-test="local-storage-sets-list"
        />
        <ButtonContainer>
          <ButtonDefault
            data-test="local-storage-sets-clear-all"
            @click="confirmAndDeleteAllSets"
          >
            {{ t('localStorageDeprecation.setsPage.buttonClearAll') }}
          </ButtonDefault>
        </ButtonContainer>
      </div>
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import useLocalStorageSets from '@/modules/useLocalStorageSets'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import ListSets from '@/pages/sets/components/SetsList.vue'
import ButtonContainer from '@/components/buttons/ButtonContainer.vue'
import BackLink from '@/components/BackLink.vue'

const { t } = useI18n()
const { sets, deleteAllSets } = useLocalStorageSets()

const confirmAndDeleteAllSets = () => {
  if (confirm(t('localStorageDeprecation.setsPage.confirmClearAll'))) {
    deleteAllSets()
  }
}
</script>
