<template>
  <div class="min-h-screen flex flex-col">
    <RouterView />
    <footer class="mx-auto mt-auto pt-20 px-2 pb-2 w-full max-w-md print:hidden">
      <small class="block text-gray-400">
        <Translation keypath="footer.support">
          <template #email>
            <LinkDefault href="mailto:support@sate.tools?subject=Lightning%20Tip%20Cards%20Feedback">support@sate.tools</LinkDefault>
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
