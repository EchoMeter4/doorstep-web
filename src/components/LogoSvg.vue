<script setup>
const props = defineProps({
  textClasses: {
    type: String,
    default: 'text-black',
  },
})
</script>

<template>
  <svg
    class="block"
    viewBox="48 48 757 224"
    preserveAspectRatio="xMinYMin meet"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="iconGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#4F7DFF" />
        <stop offset="1" stop-color="#355CFF" />
      </linearGradient>
    </defs>

    <!-- Icon container -->
    <rect x="64" y="64" width="192" height="192" rx="44" fill="url(#iconGrad)" />

    <!-- Flat door + step icon (minimal, no 3D) -->
    <g transform="translate(64,53)">
      <rect x="46" y="154" width="100" height="14" rx="7" fill="#FFFFFF" />
      <rect x="62" y="51" width="68" height="112" rx="12" stroke="#FFFFFF" stroke-width="8" />
      <circle cx="114" cy="104" r="6" fill="#FFFFFF" />
    </g>

    <!-- Wordmark -->
    <text
      x="320"
      y="190"
      class="wordmark fill-current"
      :class="props.textClasses"
      font-size="96"
      letter-spacing="-1"
    >
      Doorstep
    </text>
  </svg>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap');
.wordmark {
  font-family:
    'Poppins',
    system-ui,
    -apple-system,
    Segoe UI,
    Roboto,
    Arial,
    sans-serif;
  font-weight: 600;
}
</style>
