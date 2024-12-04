<template>
  <ParagraphDefault class="text-center" data-test="sets-list-message-empty">
    {{ $t('sets.noSavedCardsSetsMessage') }}
    <br>
    <LinkDefault :to="{ name: 'cards', params: { lang: $route.params.lang } }">
      {{ $t('home.buttonCreate') }}
    </LinkDefault>
  </ParagraphDefault>
</template>

<script setup lang="ts">
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
</script>
