<template>
  <TheLayout>
    <CenterContainer>
      <HeadlineDefault level="h1">
        {{ $t('privacyPolicy.title') }}
      </HeadlineDefault>

      <section class="my-10">
        <HeadlineDefault level="h2">
          {{ $t('privacyPolicy.section1.title') }}
        </HeadlineDefault>
        <ParagraphDefault>{{ $t('privacyPolicy.section1.description') }}</ParagraphDefault>
        <ParagraphDefault>
          {{ PRIVACY_POLICY_CONTACT_NAME }}, <LinkDefault :href="'mailto:' + PRIVACY_POLICY_CONTACT_EMAIL" />
        </ParagraphDefault>
      </section>

      <section class="my-10">
        <HeadlineDefault level="h2">
          {{ $t('privacyPolicy.section2.title') }}
        </HeadlineDefault>
        <HeadlineDefault level="h3">
          {{ $t('privacyPolicy.section2.subsection1.title') }}
        </HeadlineDefault>
        <ul class="list-disc ps-6">
          <li>{{ $t('privacyPolicy.section2.subsection1.item1') }}</li>
          <li>{{ $t('privacyPolicy.section2.subsection1.item2') }}</li>
          <li>{{ $t('privacyPolicy.section2.subsection1.item3') }}</li>
          <li>{{ $t('privacyPolicy.section2.subsection1.item4') }}</li>
          <li>{{ $t('privacyPolicy.section2.subsection1.item5') }}</li>
        </ul>
        <ParagraphDefault>{{ $t('privacyPolicy.section2.subsection1.description') }}</ParagraphDefault>
        <HeadlineDefault level="h3">
          {{ $t('privacyPolicy.section2.subsection2.title') }}
        </HeadlineDefault>
        <ul class="list-disc ps-6">
          <li>{{ $t('privacyPolicy.section2.subsection2.item1') }}</li>
          <li>{{ $t('privacyPolicy.section2.subsection2.item2') }}</li>
          <li>{{ $t('privacyPolicy.section2.subsection2.item3') }}</li>
        </ul>
        <ParagraphDefault>{{ $t('privacyPolicy.section2.subsection2.description') }}</ParagraphDefault>
      </section>

      <section class="my-10">
        <HeadlineDefault level="h2">
          {{ $t('privacyPolicy.section3.title') }}
        </HeadlineDefault>
        <ParagraphDefault>{{ $t('privacyPolicy.section3.subsection1.title') }}</ParagraphDefault>
        <ul class="list-disc ps-6">
          <li>{{ $t('privacyPolicy.section3.subsection1.item1') }}</li>
          <li>{{ $t('privacyPolicy.section3.subsection1.item2') }}</li>
          <li>{{ $t('privacyPolicy.section3.subsection1.item3') }}</li>
          <li>{{ $t('privacyPolicy.section3.subsection1.item4') }}</li>
        </ul>
        <ParagraphDefault>{{ $t('privacyPolicy.section3.legalBasis') }}</ParagraphDefault>
      </section>

      <section class="my-10">
        <HeadlineDefault level="h2">
          {{ $t('privacyPolicy.section4.title') }}
        </HeadlineDefault>
        <ParagraphDefault>{{ $t('privacyPolicy.section4.description') }}</ParagraphDefault>
      </section>

      <section class="my-10">
        <HeadlineDefault level="h2">
          {{ $t('privacyPolicy.section5.title') }}
        </HeadlineDefault>
        <ParagraphDefault>{{ $t('privacyPolicy.section5.description') }}</ParagraphDefault>
      </section>

      <section class="my-10">
        <HeadlineDefault level="h2">
          {{ $t('privacyPolicy.section6.title') }}
        </HeadlineDefault>
        <ul class="list-disc ps-6">
          <li>{{ $t('privacyPolicy.section6.item1') }}</li>
          <li>{{ $t('privacyPolicy.section6.item2') }}</li>
          <li>{{ $t('privacyPolicy.section6.item3') }}</li>
          <li>{{ $t('privacyPolicy.section6.item4') }}</li>
          <li>{{ $t('privacyPolicy.section6.item5') }}</li>
          <li>{{ $t('privacyPolicy.section6.item6') }}</li>
        </ul>
        <ParagraphDefault>{{ $t('privacyPolicy.section6.description') }}</ParagraphDefault>
      </section>

      <section class="my-10">
        <HeadlineDefault level="h2">
          {{ $t('privacyPolicy.section7.title') }}
        </HeadlineDefault>
        <HeadlineDefault level="h3">
          {{ $t('privacyPolicy.section7.subsection1.title') }}
        </HeadlineDefault>
        <ParagraphDefault>{{ $t('privacyPolicy.section7.subsection1.description') }}</ParagraphDefault>
        <HeadlineDefault level="h3">
          {{ $t('privacyPolicy.section7.subsection2.title') }}
        </HeadlineDefault>
        <ul class="list-disc ps-6">
          <li>{{ $t('privacyPolicy.section7.subsection2.item1') }}</li>
          <li>{{ $t('privacyPolicy.section7.subsection2.item2') }}</li>
          <li>{{ $t('privacyPolicy.section7.subsection2.item3') }}</li>
        </ul>
        <HeadlineDefault level="h3">
          {{ $t('privacyPolicy.section7.subsection3.title') }}
        </HeadlineDefault>
        <ParagraphDefault>{{ $t('privacyPolicy.section7.subsection3.description') }}</ParagraphDefault>
      </section>

      <section class="my-10">
        <HeadlineDefault level="h2">
          {{ $t('privacyPolicy.section8.title') }}
        </HeadlineDefault>
        <ParagraphDefault>{{ $t('privacyPolicy.section8.description') }}</ParagraphDefault>
      </section>

      <section class="my-10">
        <HeadlineDefault level="h2">
          {{ $t('privacyPolicy.section9.title') }}
        </HeadlineDefault>
        <ParagraphDefault>{{ $t('privacyPolicy.section9.contact') }}</ParagraphDefault>
        <ParagraphDefault>
          {{ PRIVACY_POLICY_CONTACT_NAME }}, <LinkDefault :href="'mailto:' + PRIVACY_POLICY_CONTACT_EMAIL" />
        </ParagraphDefault>
      </section>

      <footer>
        <ParagraphDefault>{{ $t('privacyPolicy.footer.thanks') }}</ParagraphDefault>
      </footer>
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import TheLayout from '@/components/layout/TheLayout.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import { PRIVACY_POLICY_CONTACT_NAME, PRIVACY_POLICY_CONTACT_EMAIL } from '@/constants'
</script>
