<template>
  <div class="flex flex-col rounded-t-2xl px-5 py-7 bg-bluegrey">
    <HeadlineDefault level="h2" class="!text-white">
      Bug, Feedback oder Fragen?
    </HeadlineDefault>
    <ParagraphDefault class="mb-8 text-white">
      Hier kommen einige Fragen hin!
    </ParagraphDefault>
    <ButtonDefault :to="{ name: 'home' }" reduced-animation>
      Zu den FAQs
    </ButtonDefault>
  </div>
</template>

<script setup lang="ts">
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
</script>
