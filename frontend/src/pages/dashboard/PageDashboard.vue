<template>
  <TheLayout>
    <div class="bg-grey-light">
      <CenterContainer class="!py-10">
        <div class="flex gap-12 items-center">
          <IconPersonCircleFilled class="w-12 h-12" />
          <div class="flex-1">
            <HeadlineDefault
              level="h2"
              styling="h3"
              class="mb-1"
            >
              {{ $t('dashboard.welcome') }}
            </HeadlineDefault>
            <LinkDefault
              :to="{ name: 'user-account' }"
              no-bold
              class="text-lg"
            >
              {{ userDisplayName || $t('userAccount.completeProfile') }}
            </LinkDefault>
          </div>
        </div>
        <CardsSummary class="my-10" />
      </CenterContainer>
    </div>
  </TheLayout>
</template>
<script setup lang="ts">
import CardsSummary from '@/components/CardsSummary.vue'
import IconPersonCircleFilled from '@/components/icons/IconPersonCircleFilled.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import { useProfileStore } from '@/stores/profile'
import { storeToRefs } from 'pinia'

const profileStore = useProfileStore()
const { userDisplayName } = storeToRefs(profileStore)
</script>
