<template>
  <div>
    <p class="text-red-500 mb-2">
      {{ $t('bulkWithdraw.genericErrorMessage') }}
    </p>
    <LinkDefault
      variant="no-border"
      @click="reload()"
    >
      {{ $t('bulkWithdraw.reload') }}
    </LinkDefault>
  </div>
</template>

<script lang="ts" setup>
import LinkDefault from '@/components/typography/LinkDefault.vue'

const reload = () => location.reload()
</script>
