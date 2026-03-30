<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: null,
  options: Array,
})

const current = computed(() => props.options.find((o) => o.value === props.modelValue))
</script>

<template>
  <span
    class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
    :class="current?.pillClass"
  >
    <span class="size-1.5 rounded-full shrink-0" :class="current?.dotClass" />
    {{ current?.label }}
  </span>
</template>
