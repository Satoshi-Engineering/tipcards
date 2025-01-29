<template>
  <section
    v-if="openTasks.length > 0"
    data-test="open-tasks"
  >
    <CenterContainer class="!py-10">
      <header class="flex items-end gap-4">
        <HeadlineDefault
          level="h2"
          class="mb-0"
        >
          {{ $t('dashboard.openTasks.title') }}
        </HeadlineDefault>
        <div class="text-sm pb-1 italic" data-test="open-tasks-count">
          {{
            openTasksWithLoadingStatus.status !== 'success'
              ? '&nbsp;'
              : `(${$t('dashboard.openTasks.cardCount', { count: cardCount }, cardCount)})`
          }}
        </div>
      </header>
      <ItemsListWithMessages
        class="my-7"
        :header-primary="$t('dashboard.openTasks.headerPrimary')"
        :header-secondary="$t('general.amount')"
        :items="sortedOpenTasks"
        :loading="openTasksWithLoadingStatus.status === 'loading'"
        :not-logged-in="!isLoggedIn"
        data-test="open-tasks-list"
      >
        <template #default="{ item: openTask }">
          <OpenTasksListItemSetAction
            v-if="openTask.type === OpenTaskType.enum.setAction"
            :open-task="openTask"
          />
          <OpenTasksListItemCardAction
            v-else
            :open-task="openTask"
          />
        </template>
      </ItemsListWithMessages>
    </CenterContainer>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import { OpenTaskType, type OpenTaskDto } from '@shared/data/trpc/OpenTaskDto'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import ItemsListWithMessages from '@/components/itemsList/ItemsListWithMessages.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import { useAuthStore } from '@/stores/auth'
import useTRpc from '@/modules/useTRpc'
import OpenTasksListItemSetAction from './OpenTasksListItemSetAction.vue'
import OpenTasksListItemCardAction from './OpenTasksListItemCardAction.vue'

const { t } = useI18n({ useScope: 'global' })

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)
const { card } = useTRpc()

type OpenTasksWithLoadingStatus
  = { status: 'loading' | 'error' | 'notLoaded', openTasks?: undefined }
  | { status: 'success', openTasks: OpenTaskDto[] }

const openTasksWithLoadingStatus = ref<OpenTasksWithLoadingStatus>({ status: 'notLoaded' })
const openTasksErrorMessages = ref<string[]>([])
const openTasks = computed<OpenTaskDto[]>(() => openTasksWithLoadingStatus.value.status === 'success'
  ? openTasksWithLoadingStatus.value.openTasks
  : [])
const sortedOpenTasks = computed(() => [...openTasks.value].sort((a, b) => +b.created - +a.created))
const cardCount = computed(() => openTasks.value.reduce((sum, openTask) => sum + (openTask.type === OpenTaskType.enum.setAction ? openTask.cardCount : 1), 0))

const loadOpenTasks = async () => {
  if (!isLoggedIn.value) {
    return
  }
  openTasksWithLoadingStatus.value = { status: 'loading' }
  openTasksErrorMessages.value = []
  try {
    const openTasks = await card.openTasks.query()
    if (!isLoggedIn.value) {
      return
    }
    openTasksWithLoadingStatus.value = {
      status: 'success',
      openTasks,
    }
  } catch (error) {
    console.error(error)
    openTasksErrorMessages.value = [t('dashboard.openTasks.errors.unableToLoadOpenTasksFromBackend')]
    openTasksWithLoadingStatus.value = { status: 'error' }
  }
}

onMounted(loadOpenTasks)
watch(isLoggedIn, (isLoggedIn) => {
  if (!isLoggedIn) {
    openTasksWithLoadingStatus.value = { status: 'notLoaded' }
    openTasksErrorMessages.value = []
  } else {
    loadOpenTasks()
  }
})
</script>
