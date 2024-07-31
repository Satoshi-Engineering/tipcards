<template>
  <CenterContainer data-test="hero-section">
    <section class="bg-grey-light px-4 pb-5 pt-7 rounded-default text-center">
      <div v-if="$slots.default" class="max-w-sm mx-auto">
        <slot name="default" />
      </div>
      <ButtonContainer v-if="$slots.buttonContainer" class="mt-5 max-w-sm mx-auto">
        <slot name="buttonContainer" />
      </ButtonContainer>
      <div v-if="$slots.default && $slots.image" class="mt-4">
        <slot name="image" />
      </div>
    </section>
  </CenterContainer>
</template>

<script setup lang="ts">
import CenterContainer from '@/components/layout/CenterContainer.vue'
import ButtonContainer from '@/components/buttons/ButtonContainer.vue'
</script>
