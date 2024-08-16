<template>
  <TheLayout
    :faqs="[FAQS.getBackSats, FAQS.bulkFunding, FAQS.support]"
  >
    <CenterContainer class="mb-10">
      <HeadlineDefault level="h1">
        Lightning TipCards Style Guide
      </HeadlineDefault>
      <ul class="flex flex-col gap-2">
        <li>
          <LinkDefault :to="{ name: 'style-guide/typography-and-buttons', params: { lang: $route.params.lang } }">
            Typography And Buttons
          </LinkDefault>
        </li>
        <li>
          <LinkDefault :to="{ name: 'style-guide/forms', params: { lang: $route.params.lang } }">
            Forms
          </LinkDefault>
        </li>
        <li>
          <LinkDefault :to="{ name: 'style-guide/icons', params: { lang: $route.params.lang } }">
            Icons
          </LinkDefault>
        </li>
        <li>
          <LinkDefault :to="{ name: 'style-guide/components', params: { lang: $route.params.lang } }">
            Components
          </LinkDefault>
        </li>
      </ul>
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import CenterContainer from '@/components/layout/CenterContainer.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import { FAQS } from '@/modules/faqs'
</script>
