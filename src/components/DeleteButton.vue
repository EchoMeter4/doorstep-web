<script setup>
import { TrashIcon } from '@heroicons/vue/24/solid'

defineProps({
  label: { type: String, default: 'Eliminar' },
})
</script>

<template>
  <button
    class="w-full text-left rounded-2xl py-3 px-4 transition-colors duration-200 flex items-center gap-3 text-red-400 hover:bg-red-50 hover:text-red-500"
  >
    <TrashIcon class="size-5 shrink-0" />
    <span class="text-sm">{{ label }}</span>
  </button>
</template>
