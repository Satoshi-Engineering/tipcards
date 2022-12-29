<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 152 152"
    class="aspect-square"
  >
    <g
      fill="none"
      stroke="#22AE73"
      stroke-width="6"
    > 
      <circle
        v-if="pending"
        class="pending"
        cx="77"
        cy="77"
        r="72"
        style="stroke-dasharray: 466px 466px; stroke-dashoffset: 932px;"
      />
      <circle
        v-if="!pending"
        cx="77"
        cy="77"
        r="72"
        style="stroke-dasharray: 466px 466px; stroke-dashoffset: 932px;"
      />
      <circle
        v-if="!pending"
        class="colored"
        fill="#22AE73"
        cx="77"
        cy="77"
        r="72"
        style="stroke-dasharray:480px, 480px; stroke-dashoffset: 960px;"
      />
      <polyline
        v-if="!pending"
        class="st0"
        stroke="#fff"
        stroke-width="10"
        points="43.5,77.8 63.7,97.9 112.2,49.4"
        style="stroke-dasharray:100px, 100px; stroke-dashoffset: 200px;"
      />   
    </g> 
  </svg>
</template>

<script setup lang="ts">
defineProps({
  pending: {
    type: Boolean,
    default: false,
  },
})

</script>

<style scoped>
@keyframes checkmark {
    0% {
        stroke-dashoffset: 100px
    }

    100% {
        stroke-dashoffset: 0px
    }
}

@keyframes checkmark-circle {
    0% {
        stroke-dashoffset: 466px 
    }

    100% {
        stroke-dashoffset: 932px
    }
}

@keyframes checkmark-circle-pending-draw {
    0% {
        stroke-dashoffset: 466px;
        stroke-dasharray: 466px 466px;

    }

    100% {
        stroke-dashoffset: 866px;
        stroke-dasharray: 466px 466px;
    }
}

@keyframes checkmark-circle-pending-spin {
    0% {
        stroke-dashoffset: 866px;
        stroke-dasharray: 400px 66px;

    }

    100% {
        stroke-dashoffset: 1798px;
        stroke-dasharray: 400px 66px;
    }
}

@keyframes colored-circle { 
    0% {
        opacity:0
    }

    100% {
        opacity:100
    }
}

circle.pending {
    animation: checkmark-circle-pending-draw 0.6s ease-in forwards,
               checkmark-circle-pending-spin 1.8s linear 0.6s infinite;
}

polyline {
    animation: checkmark 0.25s ease-in-out 0.7s backwards;
}
circle {
    animation: checkmark-circle 0.6s ease-out backwards;
}
circle.colored {
    animation: colored-circle 0.6s ease-in-out 0.7s backwards;
}
</style>
