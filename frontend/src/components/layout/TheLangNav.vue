<template>
  <ul>
    <li v-for="(locale, index) in locales" :key="locale.code">
      <div
        v-if="index !== 0"
        class="
          w-full
          border-b border-black
          m-[13px_18.5px_13px_19.5px]
          "
      />
      <div
        class="m-[13px_65px_13px_33px]"
        :class="{ 'font-bold text-yellow': locale.code === currentCode }"
      >
        {{ locale.name }}
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
/* FIL: - Questions
  - Zusammenhang --> Icon & Liste
  - Für links bestehende Componente verwenden? --> router-link
  - font-size wäre 16px? --> nearest tailwind
  - IconWorld: Size in diesem File? --> jep
  - IconX ??? How do I get it out (of zeplin?) --> copy from somewhere
  - Prop: current-code im Linter in StyleGuidePage --> should work
  - Component Test File Structure ? --> mhm ...

  // FIL:
  - Icon: ähnlichste w-, h-
  - Margins? ähnlichste z.B.: m-3
  - Trennlinie: dicke und farbe
  - LI: border in li, full width,
  - router-link text padding, mit to attribut from DefaultFooter

  - Integration Test on TheHeader which controls the lang nav
*/
import type { PropType } from 'vue'

import type { Locales } from '@/modules/langNav/Locales'

defineProps({
  locales: {
    type: Array as PropType<Locales>,
    default: () => [],
  },
  currentCode: {
    type: String,
    default: '',
  },
})

</script>
