<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentItems: Array,
  max: { type: Number, default: 2 },
})

const visible = computed(() => props.currentItems.slice(0, props.max))
const overflow = computed(() => props.currentItems.length - props.max)
</script>

<template>
  <div class="flex flex-wrap gap-1.5">
    <span
      v-for="item in visible"
      :key="item"
      class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600"
      >{{ item }}</span
    >
    <span
      v-if="overflow > 0"
      class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500"
      >+{{ overflow }} más</span
    >
  </div>
</template>
