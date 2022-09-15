<template>
  <div class="min-h-screen flex flex-col">
    <RouterView />
    <footer class="mx-auto mt-auto pt-20 mb-2 w-full max-w-md">
      <small class="block text-gray-400">
        <Translation keypath="footer.support">
          <template #email>
            <LinkDefault href="mailto:support@sate.tools">support@sate.tools</LinkDefault>
          </template>
        </Translation>
      </small>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Translation } from 'vue-i18n'
import LinkDefault from './components/typography/LinkDefault.vue'
</script>
