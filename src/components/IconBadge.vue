<script setup>
defineProps({
  icon: { type: Object, default: null },
  label: String,
  colorClass: String,
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit"
    :class="colorClass"
  >
    <component v-if="icon" :is="icon" class="size-3" />
    {{ label }}
  </span>
</template>
