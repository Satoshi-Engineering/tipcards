<template>
  <footer
    class="print:hidden"
    v-bind="$attrs"
  >
    <div class="flex flex-col rounded-t-2xl mb-px px-5 py-7 bg-bluegrey">
      <HeadlineDefault level="h2" class="!text-white">
        Bug, Feedback oder Fragen?
      </HeadlineDefault>
      <ParagraphDefault class="mb-8 text-white">
        Hier kommen einige Fragen hin!
      </ParagraphDefault>
      <ButtonDefault :to="{ name: 'home' }">
        Zu den FAQs
      </ButtonDefault>
    </div>
    <div class="px-5 py-7 pb-2 bg-bluegrey !text-white">
      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
    </div>
  </footer>
</template>

<script setup lang="ts">
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
</script>
