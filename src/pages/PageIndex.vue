<template>
  <div class="grid place-items-center text-center min-h-screen">
    <div>
      <div class="text-6xl">
        ⚡
      </div>
      <h1 class="text-xl font-bold my-4">Lightning Tip Cards</h1>
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
</script>
