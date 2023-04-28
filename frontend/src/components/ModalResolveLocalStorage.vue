<template>
  <ModalDefault
    :headline="$t('components.modalResolveLocalStorage.headline')"
    :close-on-backdrop-click="false"
    :show-close-button="false"
  >
    <template #default>
      {{ $t('components.modalResolveLocalStorage.text') }}
    </template>
    <template #footer>
      <ButtonDefault class="mr-3" @click="migrate">
        {{ $t('components.modalResolveLocalStorage.migrate') }}
      </ButtonDefault>
      <ButtonDefault variant="outline" @click="logout">
        {{ $t('components.modalResolveLocalStorage.logout') }}
      </ButtonDefault>
    </template>
  </ModalDefault>
</template>

<script lang="ts" setup>
import ButtonDefault from '@/components/ButtonDefault.vue'
import ModalDefault from '@/components/ModalDefault.vue'
import { useUserStore } from '@/stores/user'

const { logout } = useUserStore()

const migrate = () => {
  alert('not implemented yet')
}
</script>
