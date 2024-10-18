<template>
  <CenterContainer
    v-if="$te('landing.sectionMore.headline')"
    class="relative flex flex-col"
    data-test="more-bitcoin-explanation"
  >
    <HeadlineDefault level="h2">
      {{ $t('landing.sectionMore.headline') }}
    </HeadlineDefault>
    <ParagraphDefault v-if="$te('landing.sectionMore.text')">
      {{ $t('landing.sectionMore.text') }}
    </ParagraphDefault>

    <template
      v-for="index of [...Array(10).keys()]"
      :key="index"
    >
      <CollapsibleElement
        v-if="$te(`landing.sectionMore.${index}.title`)"
        class="my-2 first:mt-0 last:mb-0"
        level="h4"
        hover-press-effect
        :title="$t(`landing.sectionMore.${index}.title`)"
      >
        <!--eslint-disable vue/no-v-html, vue/no-v-text-v-html-on-component -->
        <ParagraphDefault
          v-if="$te(`landing.sectionMore.${index}.text`)"
          v-html="sanitizeI18n($t(`landing.sectionMore.${index}.text`))"
        />
        <!--eslint-enable vue/no-v-html, vue/no-v-text-v-html-on-component -->
        <ParagraphDefault v-if="$te(`landing.sectionMore.${index}.linkHref`)">
          <LinkDefault :href="$t(`landing.sectionMore.${index}.linkHref`)">
            {{ $t(`landing.sectionMore.${index}.linkLabel`) }}
          </LinkDefault>
        </ParagraphDefault>
      </CollapsibleElement>
    </template>
  </CenterContainer>
</template>

<script setup lang="ts">
import CollapsibleElement from '@/components/CollapsibleElement.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import sanitizeI18n from '@/modules/sanitizeI18n'
</script>
