<template>
  <section id="open-tasks">
    <CenterContainer class="!py-10">
      <header class="flex items-end gap-4">
        <HeadlineDefault
          level="h2"
          class="mb-0"
        >
          todo : Offene Aktionen
        </HeadlineDefault>
        <div class="text-sm pb-1 italic" data-test="open-tasks-count">
          {{
            openTasksWithLoadingStatus.status !== 'success'
              ? '&nbsp;'
              : `todo : (${openTasksWithLoadingStatus.openTasks.length} offene Aktion(en))`
          }}
        </div>
      </header>
      <ItemsListWithMessages
        class="my-7"
        header-primary="todo : Beschreibung"
        header-secondary="todo : Betrag"
        :items="openTasks.slice(0, 3)"
        :loading="openTasksWithLoadingStatus.status === 'loading'"
        data-test="open-tasks-list"
      >
        <template #default="{ item: openTask }">
          <LinkDefault
            v-if="openTask.type === OpenTaskType.enum.cardAction"
            class="
              -mx-5 px-5 py-4 group-last:pb-6 group-last:rounded-b-default
              grid grid-cols-[1fr,auto] grid-rows-[repeat(3,auto)] hover:bg-grey-light
            "
            no-underline
            no-bold
            :to="{
              name: 'funding',
              params: {
                cardHash: openTask.cardHash,
                lang: $route.params.lang,
              }
            }"
          >
            <CardStatusPill
              class="col-start-1 place-self-start -ms-0.5"
              :status="openTask.cardStatus"
            />
            <HeadlineDefault
              level="h4"
              class="col-start-1 !my-2"
            >
              {{ openTask.noteForStatusPage || openTask.textForWithdraw }}
            </HeadlineDefault>
            <div class="col-start-1 text-sm">
              {{ $t('cardStatus.created') }}:
              <time>
                {{ $d(openTask.created, dateWithTimeFormat) }}
              </time>
            </div>
            <div class="-col-end-1 -row-end-1 mb-1 place-self-end text-sm font-bold">
              {{ $t('general.amountAndUnitSats', { amount: openTask.sats }, openTask.sats) }}
            </div>
          </LinkDefault>
          <LinkDefault
            v-else-if="openTask.type === OpenTaskType.enum.setAction"
            class="
              -mx-5 px-5 py-4 group-last:pb-6 group-last:rounded-b-default
              grid grid-cols-[1fr,auto] grid-rows-[repeat(4,auto)] hover:bg-grey-light
            "
            no-underline
            no-bold
            :to="{
              name: openTask.cardStatus === CardStatusEnum.enum.isLockedByBulkWithdraw
                ? 'bulk-withdraw'
                : 'set-funding',
              params: {
                setId: openTask.setId,
                settings: encodeCardsSetSettingsFromDto(openTask.setSettings),
                lang: $route.params.lang,
              }
            }"
          >
            <span
              class="
                col-start-1 place-self-start -ms-0.5
                inline-flex px-3 py-0.5 font-bold text-xs rounded-full
                bg-blueViolet-light text-blueViolet
              "
            >
              todo : {{ openTask.cardStatus }}
            </span>
            <HeadlineDefault
              level="h4"
              class="col-start-1 !my-2"
            >
              {{ openTask.setSettings.name }}
            </HeadlineDefault>
            <div class="col-start-1 text-sm">
              {{ `${openTask.cardCount} Karten` }}
            </div>
            <div class="col-start-1 text-sm">
              {{ $t('cardStatus.created') }}:
              <time>
                {{ $d(openTask.created, dateWithTimeFormat) }}
              </time>
            </div>
            <div class="-col-end-1 -row-end-1 mb-1 place-self-end text-sm font-bold">
              {{ $t('general.amountAndUnitSats', { amount: openTask.sats }, openTask.sats) }}
            </div>
          </LinkDefault>
        </template>
      </ItemsListWithMessages>
      <div v-if="isLoggedIn && openTasks.length > 3" class="text-center">
        <LinkDefault
          href="#"
          no-bold
          class="text-lg"
        >
          todo : Link to all open tasks
        </LinkDefault>
      </div>
    </CenterContainer>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'

import { OpenTaskType, type OpenTaskDto } from '@shared/data/trpc/OpenTaskDto'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import ItemsListWithMessages from '@/components/itemsList/ItemsListWithMessages.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import CardStatusPill from '@/components/cardStatusList/components/CardStatusPill.vue'
import { useAuthStore } from '@/stores/auth'
import useTRpc from '@/modules/useTRpc'
import { encodeCardsSetSettingsFromDto } from '@/utils/cardsSetSettings'
import { dateWithTimeFormat } from '@/utils/dateFormats'
import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto'

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

const loadOpenTasks = async () => {
  if (!isLoggedIn.value) {
    return
  }
  openTasksWithLoadingStatus.value = { status: 'loading' }
  openTasksErrorMessages.value = []
  try {
    const openTasks = await card.openTasks.query()
    openTasksWithLoadingStatus.value = {
      status: 'success',
      openTasks,
    }
  } catch (error) {
    console.error(error)
    openTasksErrorMessages.value = ['todo : add error message']
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
