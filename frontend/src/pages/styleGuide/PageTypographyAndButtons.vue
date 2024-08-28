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
        </div>
      </CenterContainer>
    </section>

    <section class="py-10 bg-grey-light">
      <CenterContainer>
        <HeadlineDefault level="h2">
          Button Icon Card
        </HeadlineDefault>

        <div class="flex justify-center items-center">
          <div class="grid gap-2 grid-cols-2">
            <ButtonIconCard
              class="h-[50px]"
              :to="{ name: 'style-guide', params: { lang: $route.params.lang }}"
              :disabled="dummyLoading"
            >
              <IconLogo
                class="h-8"
              />
            </ButtonIconCard>
            <ButtonIconCard
              class="row-span-2"
              href="https://satoshiengineering.com/"
              :disabled="dummyLoading"
            >
              <svg
                viewBox="0 0 71 59"
                xmlns="http://www.w3.org/2000/svg"
                width="71"
                height="59"
              >
                <defs>
                  <linearGradient
                    id="qqjw5qdq9a"
                    x1=".205%"
                    y1="105.003%"
                    x2="85.854%"
                    y2="23.398%"
                  >
                    <stop stop-color="#6B3D91" offset="3.073%" />
                    <stop stop-color="#823691" offset="32.19%" />
                    <stop stop-color="#E70075" offset="63.64%" />
                    <stop stop-color="#EC006C" offset="69.73%" />
                    <stop stop-color="#F80152" offset="79.83%" />
                    <stop stop-color="#FF0143" offset="84.9%" />
                    <stop stop-color="#FF0B39" offset="88.38%" />
                    <stop stop-color="#FF271F" offset="94.33%" />
                    <stop stop-color="#FF4700" offset="100%" />
                  </linearGradient>
                  <linearGradient
                    id="qck896x87b"
                    x1="-40.831%"
                    y1="104.284%"
                    x2="550.652%"
                    y2="-249.2%"
                  >
                    <stop stop-color="#6B3D91" offset="3.073%" />
                    <stop stop-color="#823691" offset="32.19%" />
                    <stop stop-color="#E70075" offset="63.64%" />
                    <stop stop-color="#EC006C" offset="69.73%" />
                    <stop stop-color="#F80152" offset="79.83%" />
                    <stop stop-color="#FF0143" offset="84.9%" />
                    <stop stop-color="#FF0B39" offset="88.38%" />
                    <stop stop-color="#FF271F" offset="94.33%" />
                    <stop stop-color="#FF4700" offset="100%" />
                  </linearGradient>
                  <linearGradient
                    id="cptq3a1qec"
                    x1="-629.471%"
                    y1="746.359%"
                    x2="334.157%"
                    y2="-240.893%"
                  >
                    <stop stop-color="#6B3D91" offset="3.073%" />
                    <stop stop-color="#823691" offset="32.19%" />
                    <stop stop-color="#E70075" offset="63.64%" />
                    <stop stop-color="#EC006C" offset="69.73%" />
                    <stop stop-color="#F80152" offset="79.83%" />
                    <stop stop-color="#FF0143" offset="84.9%" />
                    <stop stop-color="#FF0B39" offset="88.38%" />
                    <stop stop-color="#FF271F" offset="94.33%" />
                    <stop stop-color="#FF4700" offset="100%" />
                  </linearGradient>
                  <linearGradient
                    id="yc3wvdombd"
                    x1="-273.993%"
                    y1="381.983%"
                    x2="691.539%"
                    y2="-606.243%"
                  >
                    <stop stop-color="#6B3D91" offset="3.073%" />
                    <stop stop-color="#823691" offset="32.19%" />
                    <stop stop-color="#E70075" offset="63.64%" />
                    <stop stop-color="#EC006C" offset="69.73%" />
                    <stop stop-color="#F80152" offset="79.83%" />
                    <stop stop-color="#FF0143" offset="84.9%" />
                    <stop stop-color="#FF0B39" offset="88.38%" />
                    <stop stop-color="#FF271F" offset="94.33%" />
                    <stop stop-color="#FF4700" offset="100%" />
                  </linearGradient>
                </defs>
                <g>
                  <path d="M41.362 13.183c1.702-.965 3.988-1.447 6.912-1.447 2.392 0 4.678.321 6.964.91 2.233.644 4.2 1.34 5.902 2.144 1.223.804 2.552 1.233 3.88 1.233 1.543 0 2.819-.59 3.829-1.769 1.01-1.179 1.488-2.518 1.488-4.126 0-2.036-.797-3.697-2.445-4.984-1.914-1.5-4.626-2.733-8.028-3.644C56.62.643 53.112.214 49.337.16A2.119 2.119 0 0 0 48.54 0H31.527c-1.489 0-2.658 1.179-2.658 2.68 0 1.5 1.17 2.679 2.658 2.679h4.147v.053c1.276.215 2.233 1.286 2.233 2.626 0 1.5-1.17 2.68-2.659 2.68H20.47c-1.49 0-2.659 1.178-2.659 2.679 0 1.5 1.17 2.68 2.659 2.68h3.774v.053c1.276.214 2.18 1.286 2.18 2.626a2.699 2.699 0 0 1-2.073 2.625l-13.77.054c-1.489 0-2.658 1.179-2.658 2.68 0 1.5 1.17 2.679 2.658 2.679h22.435c1.49 0 2.659 1.179 2.659 2.68 0 1.392-1.064 2.518-2.446 2.679l-2.924.053c-1.489 0-2.658 1.18-2.658 2.68 0 1.5 1.17 2.679 2.658 2.679h23.074c1.488 0 2.658 1.179 2.658 2.68 0 1.232-.85 2.304-2.02 2.572 0 .053-38.066.107-38.066.107-1.49 0-2.659 1.179-2.659 2.68 0 1.5 1.17 2.678 2.659 2.678h20.893c1.489 0 2.659 1.18 2.659 2.68 0 1.5-1.17 2.68-2.659 2.68H26.317c-1.489 0-2.659 1.178-2.659 2.679 0 1.5 1.17 2.679 2.659 2.679h18.076c7.709-.054 13.663-1.608 17.863-4.662 4.307-3.108 6.433-7.556 6.433-13.29 0-3.537-.904-6.377-2.764-8.52-1.808-2.144-3.988-3.805-6.486-4.93-2.5-1.126-5.742-2.251-9.623-3.484-3.828-1.125-6.593-2.143-8.347-3.108-1.755-.91-2.605-2.25-2.605-3.965-.054-1.608.797-2.894 2.498-3.858z" fill="url(#qqjw5qdq9a)" />
                  <path d="M6.38 48.39H2.658C1.17 48.39 0 47.21 0 45.71c0-1.5 1.17-2.68 2.658-2.68H6.38c1.488 0 2.658 1.18 2.658 2.68 0 1.5-1.223 2.68-2.658 2.68z" fill="url(#qck896x87b)" />
                  <path d="M20.894 5.52c-.691 0-1.382-.268-1.86-.804-.107-.107-.214-.268-.32-.429-.106-.16-.16-.322-.266-.482l-.16-.483c-.052-.16-.052-.321-.052-.535 0-.161 0-.322.053-.536l.16-.483c.052-.16.159-.321.265-.482.106-.16.213-.268.32-.429a2.678 2.678 0 0 1 2.392-.75l.478.16c.16.055.319.162.478.269.16.107.266.214.426.321.106.108.212.268.319.43.106.16.16.32.266.481l.16.483c.052.16.052.321.052.536 0 .16 0 .375-.053.535l-.16.483c-.053.16-.159.321-.265.482-.107.16-.213.268-.32.429-.106.107-.265.214-.425.321-.159.107-.319.161-.478.268l-.478.16c-.213.055-.373.055-.532.055z" fill="url(#cptq3a1qec)" />
                  <path d="M2.658 26.955c-.69 0-1.382-.268-1.86-.804a2.97 2.97 0 0 1-.32-.429c-.106-.16-.159-.321-.265-.482l-.16-.483C0 24.597 0 24.436 0 24.222c0-.161 0-.322.053-.536l.16-.483c.053-.16.16-.321.265-.482.107-.16.213-.268.32-.429.106-.107.265-.214.425-.321.16-.107.319-.16.478-.268l.479-.16a3.194 3.194 0 0 1 1.01 0l.478.16c.16.054.32.16.479.268.16.107.266.214.425.321.107.108.213.268.32.43.106.16.159.32.265.481l.16.483c.053.16.053.321.053.536 0 .16 0 .375-.053.535l-.16.483c-.053.16-.16.321-.266.482-.106.16-.212.268-.319.429a2.687 2.687 0 0 1-1.914.804z" fill="url(#yc3wvdombd)" />
                </g>
              </svg>
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
