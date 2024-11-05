<template>
  <TheLayout
    :faqs="[FAQS.getBackSats, FAQS.bulkFunding, FAQS.support]"
  >
    <CenterContainer class="mb-10">
      <BackLink :to="{ name: 'style-guide', params: { lang: $route.params.lang }}">
        Style Guide
      </BackLink>
      <HeadlineDefault level="h1" class="mt-0">
        Lightning TipCards Style Guide
      </HeadlineDefault>
      <HeadlineDefault level="h2">
        Lightning TipCards Style Guide
      </HeadlineDefault>
      <HeadlineDefault level="h3">
        Lightning TipCards Style Guide
      </HeadlineDefault>
      <HeadlineDefault level="h4">
        Lightning TipCards Style Guide
      </HeadlineDefault>
      <ParagraphDefault>
        <LinkDefault href="https://www.lipsum.com/">Lorem Ipsum</LinkDefault> is simply dummy
        text of the printing and typesetting industry. Lorem Ipsum has been the industry's
        standard dummy text ever since the 1500s, when an unknown printer took a galley of type
        and scrambled it to make a type specimen book. It has survived not only five centuries,
        but also the leap into electronic typesetting, remaining
        <LinkDefault :to="dummyLink">essentially unchanged</LinkDefault>. It was popularised
        in the 1960s with the release of Letraset sheets containing
        <LinkDefault @click="onDummyClick">Lorem Ipsum</LinkDefault> passages, and more recently
        with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
      </ParagraphDefault>
      <ParagraphDefault class="text-yellow">
        <LinkDefault href="https://www.lipsum.com/">Lorem Ipsum</LinkDefault> in yellow is simply dummy text of the printing and typesetting industry.
      </ParagraphDefault>
    </CenterContainer>

    <section class="py-10 bg-grey-light">
      <CenterContainer>
        <HeadlineDefault level="h2">
          Button Default
        </HeadlineDefault>

        <ButtonContainer>
          <ButtonDefault @click="onDummyClick">
            Primary Button
          </ButtonDefault>
          <ButtonDefault reduced-animation @click="onDummyClick">
            Reduced animation
          </ButtonDefault>
        </ButtonContainer>

        <HeadlineDefault level="h3">
          Multi line
        </HeadlineDefault>
        <ButtonContainer>
          <ButtonDefault @click="onDummyClick">
            This is a very long text in this button, why would you do that?
          </ButtonDefault>
          <ButtonDefault
            variant="secondary"
            @click="onDummyClick"
          >
            This is a very long secondary text in this button, why would you do that?
          </ButtonDefault>
        </ButtonContainer>

        <HeadlineDefault level="h3">
          Loading
        </HeadlineDefault>
        <ButtonContainer>
          <ButtonDefault
            :loading="dummyLoading"
            @click="onDummyLoading"
          >
            Click Me To Load
          </ButtonDefault>
          <ButtonDefault
            loading
            @click="onDummyClick"
          >
            Infinite Loading
          </ButtonDefault>
        </ButtonContainer>

        <HeadlineDefault level="h3">
          Disabled
        </HeadlineDefault>
        <ButtonContainer>
          <ButtonDefault
            disabled
            @click="onDummyClick"
          >
            Disabled Primary Button
          </ButtonDefault>
          <ButtonDefault
            variant="secondary"
            disabled
            @click="onDummyClick"
          >
            Disabled Secondary Button
          </ButtonDefault>
        </ButtonContainer>

        <HeadlineDefault level="h3">
          As Router Links
        </HeadlineDefault>
        <ButtonContainer>
          <ButtonDefault :to="dummyLink">
            Primary Button
          </ButtonDefault>
          <ButtonDefault
            variant="secondary"
            :to="dummyLink"
          >
            Secondary Button
          </ButtonDefault>
        </ButtonContainer>

        <HeadlineDefault level="h3">
          As Hrefs
        </HeadlineDefault>
        <ButtonContainer>
          <ButtonDefault href="https://satoshiengineering.com/">
            Primary Button
          </ButtonDefault>
          <ButtonDefault
            variant="secondary"
            href="https://satoshiengineering.com/"
          >
            Secondary Button
          </ButtonDefault>
        </ButtonContainer>
      </CenterContainer>
    </section>

    <section class="py-10">
      <CenterContainer>
        <HeadlineDefault level="h2">
          Button Icon
        </HeadlineDefault>
        <div class="flex flex-col gap-4">
          <div class="flex gap-4">
            <ButtonIcon
              :loading="dummyLoading"
              @click="onDummyLoading"
            />
            <ButtonIcon disabled />
            <ButtonIcon loading />
            <ButtonIcon
              variant="yellow"
              icon="play"
              :loading="dummyLoading"
              @click="onDummyLoading"
            />
            <ButtonIcon
              variant="yellow"
              icon="play"
              disabled
            />
            <ButtonIcon
              variant="yellow"
              icon="play"
              loading
            />
          </div>
          <div class="flex gap-4">
            <ButtonIcon
              variant="yellow"
              :loading="dummyLoading"
              @click="onDummyLoading"
            />
            <ButtonIcon variant="yellow" disabled />
            <ButtonIcon variant="yellow" loading />
            <ButtonIcon
              icon="play"
              :loading="dummyLoading"
              @click="onDummyLoading"
            />
            <ButtonIcon
              icon="play"
              disabled
            />
            <ButtonIcon
              icon="play"
              loading
            />
          </div>
        </div>

        <HeadlineDefault level="h3">
          As Router Links
        </HeadlineDefault>
        <div class="flex gap-4">
          <ButtonIcon :to="dummyLink" />
          <ButtonIcon
            variant="yellow"
            :to="dummyLink"
          />
        </div>

        <HeadlineDefault level="h3">
          As Href
        </HeadlineDefault>
        <div class="flex gap-4">
          <ButtonIcon href="https://satoshiengineering.com/" />
          <ButtonIcon
            variant="yellow"
            href="https://satoshiengineering.com/"
          />
        </div>

        <HeadlineDefault level="h3">
          As span element
        </HeadlineDefault>
        <div class="flex gap-4">
          <ButtonIcon element="span" />
          <ButtonIcon
            variant="yellow"
            element="span"
          />
        </div>

        <HeadlineDefault level="h3">
          Sizes
        </HeadlineDefault>
        <div class="flex gap-4">
          <ButtonIcon />
          <ButtonIcon
            size="small"
          />
          <ButtonIcon
            icon="play"
          />
          <ButtonIcon
            size="small"
            icon="play"
          />
          <ButtonIcon
            icon="plus"
          />
          <ButtonIcon
            size="small"
            icon="plus"
          />
          <ButtonIcon loading />
          <ButtonIcon
            size="small"
            loading
          />
        </div>

        <HeadlineDefault level="h3">
          With Text
        </HeadlineDefault>
        <div class="flex flex-wrap gap-4">
          <ButtonIcon
            variant="yellow"
            icon="play"
            @click="onDummyLoading"
          >
            Play my Song as Button
          </ButtonIcon>
          <ButtonIcon
            variant="yellow"
            icon="play"
            disabled
            @click="onDummyLoading"
          >
            Play my Song as Disabled
          </ButtonIcon>
          <ButtonIcon
            variant="yellow"
            icon="play"
            :to="dummyLink"
          >
            Play my Song as Routerlink
          </ButtonIcon>
          <ButtonIcon
            variant="yellow"
            icon="play"
            size="small"
            :to="dummyLink"
          >
            Play my Small as Routerlink
          </ButtonIcon>
        </div>

        <HeadlineDefault level="h3">
          More icons
        </HeadlineDefault>
        <div class="flex gap-4">
          <ButtonIcon
            icon="plus"
          />
          <ButtonIcon
            icon="plus"
            disabled
          />
          <ButtonIcon
            icon="plus"
            variant="yellow"
          />
          <ButtonIcon
            variant="yellow"
            icon="plus"
            disabled
          />
          <ButtonIcon
            icon="search"
          />
          <ButtonIcon
            icon="search"
            disabled
          />
          <ButtonIcon
            variant="yellow"
            icon="search"
          />
          <ButtonIcon
            variant="yellow"
            icon="search"
            disabled
          />
        </div>
      </CenterContainer>
    </section>

    <section class="py-10 bg-grey-light">
      <CenterContainer>
        <HeadlineDefault level="h2">
          Button Icon Card
        </HeadlineDefault>

        <div class="flex justify-center items-center">
          <div class="w-[280px] grid gap-2 grid-cols-2">
            <ButtonIconCard
              :to="{ name: 'style-guide', params: { lang: $route.params.lang }}"
              :disabled="dummyLoading"
            >
              <IconLogo
                class="h-8"
              />
            </ButtonIconCard>
            <ButtonIconCard
              class="row-span-2"
              icon-class="p-8"
              href="https://satoshiengineering.com/"
              :disabled="dummyLoading"
            >
              <IconLogoSatoshiEngineeringIconOnly />
            </ButtonIconCard>
            <ButtonIconCard
              :disabled="dummyLoading"
              @click="onDummyLoading"
            >
              <img
                src="https://placehold.co/140x40"
                width="140"
                height="40"
                alt="Placeholder"
              >
            </ButtonIconCard>
          </div>
        </div>

        <HeadlineDefault level="h3">
          With description
        </HeadlineDefault>
        <ul>
          <li>
            <ButtonIconCard
              icon-class="w-[70px] h-[50px] p-1"
              :to="{ name: 'style-guide', params: { lang: $route.params.lang }}"
              :disabled="dummyLoading"
            >
              <IconLogo />
              <template #description>
                <HeadlineDefault level="h4" class="!mt-1 !mb-0">
                  Style Guide
                </HeadlineDefault>
                <ParagraphDefault class="!m-0 text-sm">
                  This is just a link back to the style guide
                </ParagraphDefault>
              </template>
            </ButtonIconCard>
          </li>
          <li>
            <ButtonIconCard
              icon-class="w-[70px] h-[50px] pt-4 pb-3"
              :to="{ name: 'style-guide', params: { lang: $route.params.lang }}"
              :disabled="dummyLoading"
            >
              <template #default>
                <IconLogoSatoshiEngineeringIconOnly />
              </template>
              <template #description>
                <HeadlineDefault level="h4" class="!mt-1 !mb-0">
                  Satoshi Engineering
                </HeadlineDefault>
                <ParagraphDefault class="!m-0 text-sm">
                  The brain behind this thing
                </ParagraphDefault>
              </template>
            </ButtonIconCard>
          </li>
        </ul>
      </CenterContainer>
    </section>
  </TheLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, type RouteLocationRaw } from 'vue-router'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonContainer from '@/components/buttons/ButtonContainer.vue'
import BackLink from '@/components/BackLink.vue'
import ButtonIcon from '@/components/buttons/ButtonIcon.vue'
import ButtonIconCard from '@/components/buttons/ButtonIconCard.vue'
import IconLogo from '@/components/icons/IconLogo.vue'
import IconLogoSatoshiEngineeringIconOnly from '@/components/icons/IconLogoSatoshiEngineeringIconOnly.vue'
import { FAQS } from '@/modules/faqs'

const route = useRoute()

const dummyLink: RouteLocationRaw = {
  name: 'cards',
  params: { setId: 'style-guide-set', lang: route.params.lang },
}

const onDummyClick = () => {
  alert('What\'s the purpose?')
}

const dummyLoading = ref(false)
const onDummyLoading = async () => {
  dummyLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 1000))
  dummyLoading.value = false
}
</script>
