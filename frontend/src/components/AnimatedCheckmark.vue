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
        cx="77"
        cy="77"
        r="72"
        style="stroke-dasharray:480px, 480px; stroke-dashoffset: 960px;"
      />
      <circle
        id="colored"
        fill="#22AE73"
        cx="77"
        cy="77"
        r="72"
        style="stroke-dasharray:480px, 480px; stroke-dashoffset: 960px;"
      />
      <polyline
        class="st0"
        stroke="#fff"
        stroke-width="10"
        points="43.5,77.8 63.7,97.9 112.2,49.4"
        style="stroke-dasharray:100px, 100px; stroke-dashoffset: 200px;"
      />   
    </g> 
  </svg>
</template>

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
        stroke-dashoffset: 480px 
    }

    100% {
        stroke-dashoffset: 960px
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

svg polyline {
    animation: checkmark 0.25s ease-in-out 0.7s backwards
}
svg circle {
    animation: checkmark-circle 0.6s ease-in-out backwards;
}
svg circle#colored {
    animation: colored-circle 0.6s ease-in-out 0.7s backwards;
} 
</style>
