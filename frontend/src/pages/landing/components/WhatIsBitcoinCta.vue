<template>
  <CenterContainer data-test="what-is-bitcoin-cta">
    <ParagraphDefault class="text-center">
      <LinkDefault
        href="#what-is-bitcoin"
        no-bold
        no-underline
        class="group"
        data-test="link-what-is-bitcoin"
      >
        <IconLogoBitcoin class="inline-block w-8 h-auto align-middle me-3" />
        <span class="underline group-hover:no-underline align-middle">
          {{ $t('landing.sectionBitcoin.title') }}
        </span>
      </LinkDefault>
    </ParagraphDefault>
  </CenterContainer>
</template>

<script setup lang="ts">
import CenterContainer from '@/components/layout/CenterContainer.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import IconLogoBitcoin from '@/components/icons/IconLogoBitcoin.vue'
</script>
