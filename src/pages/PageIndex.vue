<template>
  <div class="grid place-items-center text-center min-h-screen">
    <div>
      <div class="text-6xl">
        ⚡
      </div>
      <HeadlineDefault level="h1">
        Lightning Tip Cards
      </HeadlineDefault>
      <p>by <a href="https://satoshiengineering.com" target="_blank">Satoshi Engineering</a></p>
      <p class="mt-4">
        <RouterLink
          :to="{ name: 'codes' }"
          class="underline"
        >
          Create your QR-Codes
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router' 

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
</script>
