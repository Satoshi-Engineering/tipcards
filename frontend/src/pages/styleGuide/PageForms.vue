<template>
  <TheLayout>
    <CenterContainer class="mb-10">
      <BackLink :to="{ name: 'style-guide', params: { lang: $route.params.lang }}">
        Style Guide
      </BackLink>
      <HeadlineDefault level="h1" class="mt-0">
        Forms
      </HeadlineDefault>

      <FormContainer headline="Form Section">
        <TextField
          v-model="accountName"
          label="Account Name"
          description="This is a description for this field"
        />
        <TextField
          v-model="accountName"
          label="Account Name 2"
          description="This is a description for this field"
        />
        <TextField
          v-model="accountName"
          label="Account Name 3"
          description="This is a description for this field"
        />
      </FormContainer>
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import FormContainer from '@/components/forms/FormContainer.vue'
import TextField from '@/components/forms/TextField.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import BackLink from '@/components/BackLink.vue'

const accountName = ref('')
</script>
