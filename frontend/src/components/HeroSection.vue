<template>
  <CenterContainer>
    <section class="bg-grey-light px-4 pb-5 pt-7 rounded-default text-center">
      <slot name="default" />
      <ButtonContainer v-if="$slots.button" class="mt-5">
        <slot name="button" />
      </ButtonContainer>
      <div v-if="$slots.default && $slots.image" class="mt-6">
        <slot name="image" />
      </div>
    </section>
  </CenterContainer>
</template>

<script setup lang="ts">
import CenterContainer from '@/components/layout/CenterContainer.vue'
import ButtonContainer from '@/components/buttons/ButtonContainer.vue'
</script>
